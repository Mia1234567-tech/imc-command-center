import { ads } from '../data/ads'
import { channels } from '../data/channels'
import { kols } from '../data/kols'
import { tasks } from '../data/tasks'
import type { ChannelKey } from '../types'

// ============================================================
// 执行进度计算层
//
// 把任务、达人、投流、渠道四份数据合起来算成「进度」，
// 数据文件只存原始记录，不存算出来的百分比。
// ============================================================

/** 综合进度里四个维度的权重：任务 30% / 达人 20% / 内容 20% / 预算 30% */
const EXEC_WEIGHT = { task: 0.3, kol: 0.2, content: 0.2, budget: 0.3 }

export interface ChannelExecutionRow {
  channel: ChannelKey
  name: string
  color: string
  taskDone: number
  taskTotal: number
  taskProgress: number
  /** 该渠道是否有达人合作 */
  kolCooperation: boolean
  kolPublished: number
  kolTotal: number
  kolProgress: number
  contentDone: number
  contentTarget: number
  contentProgress: number
  spend: number
  budget: number
  budgetProgress: number
  overall: number
  /** 该渠道的点击率 = 点击量 ÷ 曝光量 */
  ctr: number
  kolImpressions: number
}

const channelKeys: ChannelKey[] = ['xiaohongshu', 'douyin', 'shipinhao']

/** 三个渠道各自的任务 / 达人 / 内容 / 预算进度 */
export const channelExecution: ChannelExecutionRow[] = channelKeys.map((key) => {
  const channel = channels.find((item) => item.key === key)!
  const ownTasks = tasks.filter((task) => task.channel === key)
  const channelKols = kols.filter((kol) => kol.channel === key)
  const published = channelKols.filter((kol) => kol.status === 'published')

  const taskProgress = ownTasks.length
    ? ownTasks.reduce((acc, task) => acc + task.progress, 0) / ownTasks.length / 100
    : 0
  const kolProgress = channelKols.length ? published.length / channelKols.length : 0
  const contentProgress = channel.contentCount / channel.targetContent
  const budgetProgress = channel.spent / channel.budget

  // 没有达人合作的渠道（微信视频号）不参与「达人」这一项：
  // 把达人权重去掉后，剩下三项按原比例重新归一，
  // 否则分母里会混进一个恒为 0 的指标，把综合进度无端拉低。
  const overall = channel.kolCooperation
    ? taskProgress * EXEC_WEIGHT.task +
      kolProgress * EXEC_WEIGHT.kol +
      contentProgress * EXEC_WEIGHT.content +
      budgetProgress * EXEC_WEIGHT.budget
    : (taskProgress * EXEC_WEIGHT.task +
        contentProgress * EXEC_WEIGHT.content +
        budgetProgress * EXEC_WEIGHT.budget) /
      (1 - EXEC_WEIGHT.kol)

  return {
    channel: key,
    name: channel.name,
    color: channel.color,
    taskDone: ownTasks.filter((task) => task.status === 'done').length,
    taskTotal: ownTasks.length,
    taskProgress,
    kolCooperation: channel.kolCooperation,
    kolPublished: published.length,
    kolTotal: channelKols.length,
    kolProgress,
    contentDone: channel.contentCount,
    contentTarget: channel.targetContent,
    contentProgress,
    spend: channel.spent,
    budget: channel.budget,
    budgetProgress,
    overall,
    ctr: channel.clicks / channel.impressions,
    kolImpressions: published.reduce((acc, kol) => acc + (kol.impressions ?? 0), 0),
  }
})

/** 按综合进度排序后的渠道，best 为第一个、worst 为最后一个 */
const rankedChannels = [...channelExecution].sort((a, b) => b.overall - a.overall)
export const bestChannelRow = rankedChannels[0]
export const worstChannelRow = rankedChannels[rankedChannels.length - 1]

/** 执行总览用的四个口径 + 综合执行度 */
export const executionSummary = {
  taskTotal: tasks.length,
  taskDone: tasks.filter((task) => task.status === 'done').length,
  taskProgress: tasks.reduce((acc, task) => acc + task.progress, 0) / tasks.length / 100,
  kolTotal: kols.length,
  kolPublished: kols.filter((kol) => kol.status === 'published').length,
  contentDone: channels.reduce((acc, channel) => acc + channel.contentCount, 0),
  contentTarget: channels.reduce((acc, channel) => acc + channel.targetContent, 0),
  spend: channels.reduce((acc, channel) => acc + channel.spent, 0),
  budget: channels.reduce((acc, channel) => acc + channel.budget, 0),
  adTotal: ads.length,
  adRunning: ads.filter((ad) => ad.status === 'running').length,
  adClicks: ads.reduce((acc, ad) => acc + ad.clicks, 0),
  adImpressions: ads.reduce((acc, ad) => acc + ad.impressions, 0),
}

/** 任务按状态统计 */
export const taskCount = {
  total: tasks.length,
  done: tasks.filter((task) => task.status === 'done').length,
  active: tasks.filter((task) => task.status === 'active').length,
  delayed: tasks.filter((task) => task.status === 'delayed').length,
}

/** 综合执行度：任务 / 达人 / 内容 / 预算 四项等权平均 */
export const overallExecution =
  (executionSummary.taskProgress +
    executionSummary.kolPublished / executionSummary.kolTotal +
    executionSummary.contentDone / executionSummary.contentTarget +
    executionSummary.spend / executionSummary.budget) /
  4

/** 达人相关汇总，用于达人表格下方那行说明 */
const publishedKols = kols.filter((kol) => kol.status === 'published')
export const kolSummary = {
  total: kols.length,
  published: publishedKols.length,
  spend: publishedKols.reduce((acc, kol) => acc + kol.quote, 0),
  impressions: publishedKols.reduce((acc, kol) => acc + (kol.impressions ?? 0), 0),
  engagements: publishedKols.reduce((acc, kol) => acc + (kol.engagements ?? 0), 0),
  get engagementRate() {
    return this.impressions ? (this.engagements / this.impressions) * 100 : 0
  },
  /** 已发布达人内容的曝光量占全站曝光的比例 */
  get impressionShare() {
    const total = channels.reduce((acc, channel) => acc + channel.impressions, 0)
    return total ? this.impressions / total : 0
  },
}

/** 投流相关汇总（金额只看消耗，效率看 CTR 与消耗节奏） */
export const adSummary = {
  spend: ads.reduce((acc, ad) => acc + ad.spend, 0),
  impressions: ads.reduce((acc, ad) => acc + ad.impressions, 0),
  clicks: ads.reduce((acc, ad) => acc + ad.clicks, 0),
  get ctr() {
    return this.impressions ? (this.clicks / this.impressions) * 100 : 0
  },
}

/** 各个投放账户的点击率对比（图表数据） */
export const adCtrCompare = ads.map((ad) => ({
  name: ad.account.split('· ')[1] ?? ad.account,
  ctr: (ad.clicks / ad.impressions) * 100,
  color: channels.find((channel) => channel.key === ad.channel)?.color ?? '#94a3b8',
}))
