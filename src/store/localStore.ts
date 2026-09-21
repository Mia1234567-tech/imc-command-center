// ============================================================
// 统一数据源（本地可编辑版）
//
// 后台管理 → 保存到浏览器 localStorage → 数据模块重新初始化 → 前台页面读取新数据
//
// 三条边界（重要）：
// 1. 不连数据库、不调接口、不做登录 —— 这是一个「本地可编辑的演示后台」；
// 2. 数据只存在**当前这个浏览器**里：换设备、或者别人打开链接，看到的仍是默认演示数据；
// 3. Node（构建期 / 自动化校验脚本）与部分 file:// 环境下没有 localStorage，
//    这里会自动判定为「不可用」并回退到代码里的默认演示数据，不会抛错。
//
// 数据模块（src/data/*.ts）在初始化时优先读这里：
//   export const tasks = load('tasks', ...) ?? defaultTasks
// 所以「保存 + 刷新页面」之后，全站所有派生数字都会用新数据重算一遍。
// ============================================================

/** 数据格式版本：改动数据结构时 +1，旧数据会被自动忽略（回退默认值） */
export const STORE_VERSION = 1

const PREFIX = 'imc-cc:'

/** 可以被后台修改的数据桶 */
export type CollectionKey =
  | 'campaign'
  | 'phases'
  | 'budgetDimensions'
  | 'kpiTargets'
  | 'tasks'
  | 'risks'

export const COLLECTION_KEYS: CollectionKey[] = [
  'campaign',
  'phases',
  'budgetDimensions',
  'kpiTargets',
  'tasks',
  'risks',
]

interface Payload<T> {
  v: number
  savedAt: string
  data: T
}

/** 拿到可用的 localStorage；不可用（服务端渲染 / 隐私模式 / file://）时返回 null */
function storage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    const ls = window.localStorage
    if (!ls) return null
    const probe = `${PREFIX}__probe`
    ls.setItem(probe, '1')
    ls.removeItem(probe)
    return ls
  } catch {
    return null
  }
}

/** 当前浏览器能不能保存数据（后台页面上会用它决定是否显示提示） */
export function storeAvailable(): boolean {
  return storage() !== null
}

/** 读取一个数据桶；没有保存过 / 版本不符 / 数据不合法时返回 null */
export function load<T>(
  key: CollectionKey,
  validate?: (value: unknown) => value is T,
): T | null {
  const ls = storage()
  if (!ls) return null
  try {
    const raw = ls.getItem(PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Payload<T>
    if (!parsed || parsed.v !== STORE_VERSION) return null
    if (validate && !validate(parsed.data)) return null
    return parsed.data
  } catch {
    return null
  }
}

/**
 * 保存一个数据桶。
 *
 * `savedAt` 一般不用传（默认用当前时间）。
 * 留这个可选参数是为了兼容历史数据：某些数据桶可能带着更早的保存时间，
 * 传进来就能保留它，后台「数据更新时间」显示的才是真正改动的时间。
 */
export function save<T>(key: CollectionKey, data: T, savedAt?: string): boolean {
  const ls = storage()
  if (!ls) return false
  try {
    const payload: Payload<T> = {
      v: STORE_VERSION,
      savedAt: savedAt ?? new Date().toISOString(),
      data,
    }
    ls.setItem(PREFIX + key, JSON.stringify(payload))
    return true
  } catch {
    return false
  }
}

/** 清空所有改动，恢复代码里的默认演示数据 */
export function clearAll(): void {
  const ls = storage()
  if (!ls) return
  COLLECTION_KEYS.forEach((key) => ls.removeItem(PREFIX + key))
}

/** 数据状态：最近一次保存时间 + 哪些数据桶被改过 */
export function readMeta(): {
  available: boolean
  savedAt: string | null
  dirtyKeys: CollectionKey[]
} {
  const ls = storage()
  if (!ls) return { available: false, savedAt: null, dirtyKeys: [] }

  let savedAt: string | null = null
  const dirtyKeys: CollectionKey[] = []

  COLLECTION_KEYS.forEach((key) => {
    try {
      const raw = ls.getItem(PREFIX + key)
      if (!raw) return
      const parsed = JSON.parse(raw) as Payload<unknown>
      if (parsed?.v !== STORE_VERSION) return
      dirtyKeys.push(key)
      if (parsed.savedAt && (!savedAt || parsed.savedAt > savedAt)) savedAt = parsed.savedAt
    } catch {
      // 单个数据桶坏了就当它没改过，不影响其它数据
    }
  })

  return { available: true, savedAt, dirtyKeys }
}

// ------------------------------------------------------------
// 校验器：确认读出来的数据结构没坏，坏就回退默认值
// ------------------------------------------------------------

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 一组记录：必须是数组，且每条都包含指定字段 */
export function recordListValidator<T>(fields: string[]) {
  return (value: unknown): value is T[] =>
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => isPlainObject(item) && fields.every((field) => field in item))
}

/** 单条记录：必须是对象，且包含指定字段 */
export function recordValidator<T>(fields: string[]) {
  return (value: unknown): value is T =>
    isPlainObject(value) && fields.every((field) => field in value)
}
