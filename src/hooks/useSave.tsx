import { useState, type ReactNode } from 'react'
import { Notice } from '../components/admin/Form'
import { save, storeAvailable, type CollectionKey } from '../store/localStore'

// ============================================================
// 后台保存（5 个管理页共用）—— 纯前端 Demo 版
//
// 数据存到哪里：**浏览器的 localStorage**（当前这台电脑、这个浏览器）。
// 保存成功后页面会重新加载，数据文件重新初始化，全站派生数字重算一遍，
// 所以前台 Dashboard / Campaign / Execution / Budget / KPI / Risk 都会读到新数据。
//
// 用法（每个管理页只有三处改动）：
//   const localSave = useSave()
//   const onSave = async () => {
//     if (!(await localSave.push([['budgetDimensions', draft]]))) return   // 失败就停下，不刷新
//     window.location.reload()                                            // 成功才刷新
//   }
//   ...
//   {localSave.notice}                                   ← 失败时的提示条
//   <SaveBar ... extra={localSave.statusNode} />          ← 「正在保存… / 已保存到本机」
//
// ★ 失败时**不刷新页面**，避免出现「以为保存了其实没保存」的错觉。
// ============================================================

export function useSave() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const push = async (items: Array<[CollectionKey, unknown]>): Promise<boolean> => {
    setSaving(true)
    setSaved(false)
    setError(null)

    // localStorage 不可用时（隐私模式等）明确报错，绝不假装保存成功
    let ok = storeAvailable()
    if (ok) {
      for (const [key, data] of items) {
        if (!save(key, data)) {
          ok = false
          break
        }
      }
    }

    setSaving(false)

    if (!ok) {
      setError('当前浏览器不允许写入本地存储（常见于隐私/无痕模式）')
      return false
    }

    setSaved(true)
    return true
  }

  // 出错时才渲染，并且自带内边距 —— 这样「没有错误」时不会凭空多出一块留白
  const notice: ReactNode = error ? (
    <div className="px-5 pt-3.5">
      <Notice tone="warn">
        <b>保存失败，数据没有写进本机。</b>
        {error}。你刚才的修改还留在页面上，处理完之后再点一次「保存」即可。
      </Notice>
    </div>
  ) : null

  const statusNode: ReactNode = saving ? (
    <span className="text-blue-600">正在保存…</span>
  ) : saved ? (
    <span className="text-emerald-600">已保存到本机</span>
  ) : null

  return { saving, saved, error, push, notice, statusNode }
}
