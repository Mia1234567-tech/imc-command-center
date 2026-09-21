// ============================================================
// 【重要声明】
// 本文件中的所有品牌、产品、金额、达人、账号、人名均为虚构，
// 仅用于个人作品集演示，不涉及任何真实企业、客户或业务数据。
// ============================================================

import type { KpiTarget } from '../types'
import { load, recordListValidator } from '../store/localStore'

// ------------------------------------------------------------
// KPI 数据：5 项核心指标的目标值、权重、责任人与统计口径
//
// 两项约定：
// 1. 「总曝光」「总点击互动」这两项的实际情况不用手写 ——
//    它们由 src/utils/kpi.ts 从每日趋势数据自动累加，
//    所以趋势图、卡片、表格永远是同一套数字；
// 2. 「A3」「TI」「平台搜索」是平台后台登记的人群资产与搜索类指标，
//    没有每日明细，直接在这里登记「本期累计」（actual）。
//
// 后台「KPI 管理」保存后会优先使用统一数据源里的版本（见文件末尾）。
// 终期目标 = 整个 Campaign（92 天）结束时要达到的量级。
// 当前时间已过 55.4%、预算已用 74.3%，5 项指标的完成率在 54% ~ 62% 之间，
// 整体略快于时间进度、慢于预算投入，属于「投入强度偏大、产出效率待优化」。
// ------------------------------------------------------------

const defaultKpiTargets: KpiTarget[] = [
  {
    key: 'impressions',
    name: '总曝光',
    unit: '次',
    target: 380_000_000,
    weight: 0.3,
    better: 'high',
    owner: '媒介组 · 李××',
    note: '三个平台品牌号内容、付费投放与达人内容的曝光合计，取各平台后台口径之和',
  },
  {
    key: 'clicksEngagements',
    name: '总点击互动',
    unit: '次',
    target: 15_600_000,
    weight: 0.25,
    better: 'high',
    owner: '内容组 · 王××',
    note: '点击量 + 互动量（点赞 / 收藏 / 评论 / 转发 / 分享）的合计口径',
  },
  {
    key: 'a3',
    name: '总 A3',
    unit: '人',
    target: 9_500_000,
    weight: 0.2,
    better: 'high',
    owner: '媒介组 · 张××',
    note: '巨量云图 5A 人群资产中的 A3（种草人群）累计规模',
    actual: 5_520_000,
  },
  {
    key: 'ti',
    name: '总 TI',
    unit: '人',
    target: 4_300_000,
    weight: 0.15,
    better: 'high',
    owner: '内容组 · 王××',
    note: '小红书灵犀 TI（Target Insight）目标人群的累计规模',
    actual: 2_360_000,
  },
  {
    key: 'search',
    name: '平台搜索',
    unit: '次',
    target: 3_800_000,
    weight: 0.1,
    better: 'high',
    owner: '媒介组 · 李××',
    note: '抖音与小红书站内搜索品牌词 / 产品词的次数合计',
    actual: 2_050_000,
  },
]

/**
 * KPI 目标：优先使用后台保存过的版本（按 key 合并）。
 *
 * 三项说明：
 * 1. name / target 后台可改；
 * 2. actual 是「本期累计」的覆盖值：登记了就优先用它，
 *    留空（undefined）就回落到由渠道数据自动累加的派生值；
 * 3. weight（权重）不在后台开放，避免改坏加权达成率的计算。
 */
const storedKpiTargets = load<KpiTarget[]>(
  'kpiTargets',
  recordListValidator<KpiTarget>(['key', 'name', 'target']),
)

export const kpiTargets: KpiTarget[] = storedKpiTargets
  ? defaultKpiTargets.map((item) => {
      const hit = storedKpiTargets.find((row) => row.key === item.key)
      if (!hit) return item
      return {
        ...item,
        name: typeof hit.name === 'string' && hit.name.trim() ? hit.name : item.name,
        target: Number.isFinite(Number(hit.target)) ? Number(hit.target) : item.target,
        actual:
          typeof hit.actual === 'number' && Number.isFinite(hit.actual)
            ? hit.actual
            : undefined,
      }
    })
  : defaultKpiTargets

