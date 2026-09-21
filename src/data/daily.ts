import { campaign } from './campaign'
import { channels } from './channels'
import { DAY_MS, dateRange, toTime } from '../utils/metrics'
import type { ChannelKey, DailyMetric, DailyTotal } from '../types'

// ============================================================
// 每日趋势数据
//
// 这些数据不是手写的，而是用「固定种子的伪随机数」生成的：
//   1. 先按 Campaign 的四个阶段给每天一个形态系数（筹备低 → 预热升 → 爆发冲高 → 收尾回落）
//   2. 加入周末上浮与随机波动
//   3. 最后整体缩放，使每日累加值 == 各渠道汇总数据（campaign.ts 里的数字）
//
// 这样做的好处：趋势图看起来自然，但合计与 KPI / 预算页完全对得上，
// 不会出现「图表加起来和卡片数字不一致」的尴尬。
// 数据是固定的，不随刷新变化。
// ============================================================

function mulberry32(seed: number) {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const CAMPAIGN_TOTAL_DAYS =
  Math.round((toTime(campaign.endDate) - toTime(campaign.startDate)) / DAY_MS) + 1

const startTime = toTime(campaign.startDate)

/** 有数据的日期区间 */
export const dates = dateRange(campaign.startDate, campaign.dataCutoff)

/** 四阶段形态系数 */
function shapeFactor(dayIndex: number): number {
  const p = dayIndex / (CAMPAIGN_TOTAL_DAYS - 1)
  if (p < 0.152) return 0.34 // 筹备期
  if (p < 0.337) return 0.72 // 预热期
  if (p < 0.717) return 1.55 // 爆发期
  return 0.48 // 收尾期
}

const METRIC_KEYS = ['spend', 'impressions', 'engagements', 'clicks'] as const

type MetricKey = (typeof METRIC_KEYS)[number]

/** 每个指标的汇总总数从渠道的哪个字段取 */
const metricSource: Record<MetricKey, (channel: (typeof channels)[number]) => number> = {
  spend: (channel) => channel.spent,
  impressions: (channel) => channel.impressions,
  engagements: (channel) => channel.engagements,
  clicks: (channel) => channel.clicks,
}

/** 把一个总数按形态拆到每一天，并保证累加结果精确等于总数 */
function distribute(total: number, seed: number, length: number): number[] {
  const rnd = mulberry32(seed)
  const raw: number[] = []
  for (let i = 0; i < length; i++) {
    const weekday = new Date(startTime + i * DAY_MS).getUTCDay()
    const weekendBoost = weekday === 0 || weekday === 6 ? 1.08 : 1
    raw.push(shapeFactor(i) * weekendBoost * (0.78 + rnd() * 0.44))
  }
  const base = raw.reduce((a, b) => a + b, 0) || 1
  const values = raw.map((v) => Math.round((total * v) / base))
  const diff = total - values.reduce((a, b) => a + b, 0)
  values[values.length - 1] += diff
  return values
}

const series = {} as Record<ChannelKey, Record<MetricKey, number[]>>

channels.forEach((channel, channelIndex) => {
  const byMetric = {} as Record<MetricKey, number[]>
  METRIC_KEYS.forEach((metric, metricIndex) => {
    byMetric[metric] = distribute(
      metricSource[metric](channel),
      20_260_920 + channelIndex * 131 + metricIndex * 17,
      dates.length,
    )
  })
  series[channel.key] = byMetric
})

/** 每日 × 渠道明细 */
export const dailyMetrics: DailyMetric[] = []
dates.forEach((date, i) => {
  channels.forEach((channel) => {
    const s = series[channel.key]
    dailyMetrics.push({
      date,
      channel: channel.key,
      spend: s.spend[i],
      impressions: s.impressions[i],
      engagements: s.engagements[i],
      clicks: s.clicks[i],
    })
  })
})

const blank = (date: string): DailyTotal => ({
  date,
  spend: 0,
  impressions: 0,
  engagements: 0,
  clicks: 0,
})

/** 全渠道每日汇总 */
export const dailyTotals: DailyTotal[] = dates.map((date, i) => {
  const row = blank(date)
  channels.forEach((channel) => {
    const s = series[channel.key]
    row.spend += s.spend[i]
    row.impressions += s.impressions[i]
    row.engagements += s.engagements[i]
    row.clicks += s.clicks[i]
  })
  return row
})

/** 单渠道每日汇总，用于画分渠道趋势 */
export const channelDaily: Record<ChannelKey, DailyTotal[]> = {} as Record<
  ChannelKey,
  DailyTotal[]
>

channels.forEach((channel) => {
  const s = series[channel.key]
  channelDaily[channel.key] = dates.map((date, i) => ({
    date,
    spend: s.spend[i],
    impressions: s.impressions[i],
    engagements: s.engagements[i],
    clicks: s.clicks[i],
  }))
})

/** 近 N 天的汇总，用于趋势图的默认窗口 */
export function lastDays(n: number): DailyTotal[] {
  return dailyTotals.slice(-n)
}

/** 近 N 天按周聚合，用于趋势图的「按周」视图 */
export function weeklyTotals(): DailyTotal[] {
  const weeks: DailyTotal[] = []
  for (let i = 0; i < dailyTotals.length; i += 7) {
    const chunk = dailyTotals.slice(i, i + 7)
    const row = blank(chunk[0].date)
    chunk.forEach((d) => {
      row.spend += d.spend
      row.impressions += d.impressions
      row.engagements += d.engagements
      row.clicks += d.clicks
    })
    weeks.push(row)
  }
  return weeks
}

/** 全局合计（与 campaign / channels 中的数字完全一致） */
export const totalSpend = dailyTotals.reduce((a, d) => a + d.spend, 0)
export const totalImpressions = dailyTotals.reduce((a, d) => a + d.impressions, 0)
export const totalEngagements = dailyTotals.reduce((a, d) => a + d.engagements, 0)
export const totalClicks = dailyTotals.reduce((a, d) => a + d.clicks, 0)
