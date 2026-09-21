import { kpiTargets } from '../data/kpi'
import { channels } from '../data/channels'
import {
  dailyTotals,
  dates,
  totalClicks,
  totalEngagements,
  totalImpressions,
} from '../data/daily'
import { achieve } from './format'
import { elapsedDays, remainingDays } from './metrics'
import type { Channel, KpiItem, KpiKey } from '../types'

// ============================================================
// KPI 计算层
//
// 数据文件（src/data/kpi.ts）只声明目标；
// 「总曝光」「总点击互动」由每日趋势数据自动累加，
// 「A3」「TI」「平台搜索」直接用平台后台登记的累计值。
// 全站任何一个 KPI 数字都从这里来，不会出现两套数字打架。
// ============================================================

const tail = (values: number[], n = 14) => values.slice(-n)

/** 由每日趋势累加出来的实际值（没有登记 actual 的指标走这里） */
const derivedActual: Record<KpiKey, number> = {
  impressions: totalImpressions,
  clicksEngagements: totalClicks + totalEngagements,
  a3: 0,
  ti: 0,
  search: 0,
}

/** 近 14 天趋势；没有每日明细的指标留空，页面上不画迷你折线 */
const trendMap: Record<KpiKey, number[] | undefined> = {
  impressions: tail(dailyTotals.map((row) => row.impressions)),
  clicksEngagements: tail(dailyTotals.map((row) => row.clicks + row.engagements)),
  a3: undefined,
  ti: undefined,
  search: undefined,
}

/** 目标 + 实际值，页面直接用这个渲染 */
export const kpiItems: KpiItem[] = kpiTargets.map((item) => ({
  ...item,
  actual: item.actual ?? derivedActual[item.key],
  trend: trendMap[item.key],
}))

/** 按权重计算的综合达成率 */
export const weightedAchievement = kpiItems.reduce(
  (acc, item) => acc + achieve(item.actual, item.target) * item.weight,
  0,
)

/** KPI 统计区间的说明数据 */
export const kpiDataRange = {
  start: dates[0],
  end: dates[dates.length - 1],
  days: dates.length,
}

export interface KpiGapRow {
  item: KpiItem
  /** 当前完成率 */
  rate: number
  /** 距离终期目标还差多少 */
  left: number
  /** 本期日均 */
  currentDaily: number
  /** 剩余天数内需要达到的日均 */
  neededDaily: number
  /** 需要把日均提升多少倍 */
  times: number
}

/**
 * 差距测算：按「剩余目标 ÷ 剩余天数」算出剩余期需要达到的日均，
 * 再和本期已经做到的日均对比，得出需要提升的倍数。
 */
export const kpiGapRows: KpiGapRow[] = kpiItems.map((item) => {
  const rate = achieve(item.actual, item.target)
  const left = Math.max(item.target - item.actual, 0)
  const currentDaily = item.actual / elapsedDays
  const neededDaily = left / Math.max(remainingDays, 1)
  return {
    item,
    rate,
    left,
    currentDaily,
    neededDaily,
    times: currentDaily ? neededDaily / currentDaily : 0,
  }
})

/** 提升倍数最大的一项，用于页面上的结论文案 */
export const hardestGap = [...kpiGapRows].sort((a, b) => b.times - a.times)[0]
/** 完成率最低的一项 */
export const lowestKpi = [...kpiGapRows].sort((a, b) => a.rate - b.rate)[0]

export interface ChannelKpiRow {
  channel: Channel
  /** 曝光达成率 */
  impressionRate: number
  /** 点击率 */
  ctr: number
  /** 互动率 */
  engagementRate: number
  /** 内容产出达成率 */
  contentRate: number
}

/** 分渠道曝光与互动拆解表 */
export const channelKpiRows: ChannelKpiRow[] = channels.map((channel) => ({
  channel,
  impressionRate: achieve(channel.impressions, channel.targetImpressions),
  ctr: channel.clicks / channel.impressions,
  engagementRate: channel.engagements / channel.impressions,
  contentRate: achieve(channel.contentCount, channel.targetContent),
}))
