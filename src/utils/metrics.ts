import { campaign, phases } from '../data/campaign'

// ============================================================
// 与时间、进度相关的派生计算
// 全站所有「进度对比」都从这里取值，改一处全局同步
// ============================================================

export const DAY_MS = 86_400_000

export function toTime(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getTime()
}

export const campaignStart = toTime(campaign.startDate)
export const campaignEnd = toTime(campaign.endDate)
export const dataCutoff = toTime(campaign.dataCutoff)

/** Campaign 总天数（含首尾） */
export const totalDays =
  Math.round((campaignEnd - campaignStart) / DAY_MS) + 1

/** 已执行天数 */
export const elapsedDays =
  Math.round((dataCutoff - campaignStart) / DAY_MS) + 1

/** 剩余天数 */
export const remainingDays = totalDays - elapsedDays

/** 时间进度，例如 0.554 */
export const timeProgress = elapsedDays / totalDays

/** 预算执行率 */
export const budgetProgress = campaign.totalSpent / campaign.totalBudget

/** 预算执行率 - 时间进度（正数=花钱超前，负数=花钱滞后） */
export const budgetGapPp = budgetProgress - timeProgress

/** 当前日均花费 */
export const dailyBurn = campaign.totalSpent / elapsedDays

/** 按剩余预算和剩余天数反推的安全日均花费 */
export const safeDailyBurn =
  (campaign.totalBudget - campaign.totalSpent) / Math.max(remainingDays, 1)

/** 实际日均花费 / 安全日均花费，>1 表示按当前节奏会超支 */
export const burnRatio = dailyBurn / safeDailyBurn

/** 剩余预算 */
export const budgetLeft = campaign.totalBudget - campaign.totalSpent

/** 按阶段天数加权得出的整体完成度 */
export const campaignProgress =
  phases.reduce((acc, phase) => {
    const days = Math.round((toTime(phase.endDate) - toTime(phase.startDate)) / DAY_MS) + 1
    return acc + (phase.progress / 100) * days
  }, 0) / totalDays

/** 生成一段日期序列 ['2026-08-01', '2026-08-02', ...] */
export function dateRange(startIso: string, endIso: string): string[] {
  const start = toTime(startIso)
  const end = toTime(endIso)
  const list: string[] = []
  for (let t = start; t <= end; t += DAY_MS) {
    list.push(new Date(t).toISOString().slice(0, 10))
  }
  return list
}

/** 阶段剩余天数 */
export function phaseDaysLeft(phase: { endDate: string }): number {
  return Math.max(Math.round((toTime(phase.endDate) - dataCutoff) / DAY_MS), 0)
}
