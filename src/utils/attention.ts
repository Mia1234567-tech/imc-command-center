import type { Tone } from '../components/ui/Badge'
import { insights } from '../data/insights'
import { worstChannelRow } from './execution'
import { moneyShort, pct, pp } from './format'
import { gapTone } from './labels'
import { budgetGapPp, budgetLeft, budgetProgress, remainingDays, safeDailyBurn, timeProgress } from './metrics'
import { kpiGapRows, weightedAchievement } from './kpi'
import { fill } from './text'
import { judgedRisks } from './risk'

// ============================================================
// Dashboard「当前需要关注」
//
// 职责：把**已经算好的结果**（预算进度差、KPI 加权达成率、
// 分渠道执行进度、风险自动判定）挑出最需要处理的最多 3 条，
// 拼成一句话说明。
//
// ⚠️ 这里不新增任何业务指标、不改任何判定规则：
//    - 预算快慢沿用 metrics 的 budgetGapPp / budgetProgress
//    - KPI 快慢沿用 kpi 的 weightedAchievement 与 kpiGapRows
//    - 渠道快慢沿用 execution 的 channelExecution
//    - 风险等级沿用 risk 的自动判定结果（utils/risk.ts）
// 只做「挑选 + 措辞」，所以改数据后这里会跟着变，不需要手改文案。
// ============================================================

/** 严重程度：与 labels.attentionSeverityMeta 的键一致 */
export type AttentionSeverity = 'bad' | 'warn' | 'good'

/** 最多展示几条 */
export const MAX_ATTENTION = 3

export interface AttentionItem {
  id: string
  /** 问题本身 */
  title: string
  /** 一句话说明 */
  desc: string
  /** 严重程度 */
  severity: AttentionSeverity
  /** 「查看详情 →」跳转到的页面 */
  to: string
  /** 跳转按钮文案 */
  toLabel: string
}

/** 只在 good / warn / bad 三档里取值（gapTone 不会返回其它档，这里做个收窄） */
const asSeverity = (tone: Tone): AttentionSeverity =>
  tone === 'bad' || tone === 'warn' ? tone : 'good'

/** 按差距大小分档：默认 ≥10pp 严重、≥3pp 需关注 */
const severityByGap = (gap: number, badAt = 0.1, warnAt = 0.03): AttentionSeverity =>
  gap >= badAt ? 'bad' : gap >= warnAt ? 'warn' : 'good'

const linkLabel = insights.dashboard.attention.linkLabel

interface Candidate extends AttentionItem {
  /** 排序用：数字越小越靠前 */
  priority: number
}

const candidates: Candidate[] = []

// ---------- 1) KPI 达成率 vs 预算投入 ----------
// 同一段时间里「钱花出去的比例」明显高于「指标做出来的比例」，
// 说明投入强度大于产出强度，这是最需要客户知道的一件事。
const kpiGap = budgetProgress - weightedAchievement
if (kpiGap > 0) {
  const slowNames = kpiGapRows.filter((row) => row.times > 1).map((row) => row.item.name)
  const template = slowNames.length
    ? insights.dashboard.attention.kpi.desc
    : insights.dashboard.attention.kpi.descAllOk
  candidates.push({
    id: 'kpi',
    priority: 1,
    severity: severityByGap(kpiGap),
    title: insights.dashboard.attention.kpi.title,
    desc: fill(template, {
      rate: pct(weightedAchievement),
      gap: pp(kpiGap),
      days: remainingDays,
      slowNames: slowNames.join('、'),
    }),
    to: '/kpi',
    toLabel: linkLabel,
  })
}

// ---------- 2) 预算执行速度 vs 时间进度 ----------
if (budgetGapPp > 0) {
  candidates.push({
    id: 'budget',
    priority: 2,
    severity: asSeverity(gapTone(budgetGapPp)),
    title: insights.dashboard.attention.budget.title,
    desc: fill(insights.dashboard.attention.budget.desc, {
      rate: pct(budgetProgress),
      time: pct(timeProgress),
      gap: pp(budgetGapPp),
      left: moneyShort(budgetLeft),
      days: remainingDays,
      safe: moneyShort(Math.round(safeDailyBurn)),
    }),
    to: '/budget',
    toLabel: linkLabel,
  })
}

// ---------- 3) 执行进度最慢的渠道 ----------
const channelGap = timeProgress - worstChannelRow.overall
if (channelGap > 0.03) {
  candidates.push({
    id: 'channel',
    priority: 3,
    severity: severityByGap(channelGap),
    title: fill(insights.dashboard.attention.channel.title, { name: worstChannelRow.name }),
    desc: fill(insights.dashboard.attention.channel.desc, {
      overall: pct(worstChannelRow.overall),
      time: pct(timeProgress),
      task: pct(worstChannelRow.taskProgress),
      content: pct(worstChannelRow.contentProgress),
      budget: pct(worstChannelRow.budgetProgress),
    }),
    to: '/execution',
    toLabel: linkLabel,
  })
}

// ---------- 4) 未闭环的重点风险 ----------
// 风险数量已经在顶部「风险状态」卡里突出显示了，
// 所以这一条排在最后，只有前三类问题不足 3 条时才补位，
// 避免同一个数字在 Dashboard 上出现两次。
const openHighRisks = judgedRisks
  .filter((risk) => risk.level === 'high' && risk.status !== 'resolved')
  .sort((a, b) => b.score - a.score)
if (openHighRisks.length) {
  const top = openHighRisks[0]
  candidates.push({
    id: 'risk',
    priority: 4,
    severity: 'bad',
    title: fill(insights.dashboard.attention.risk.title, { count: openHighRisks.length }),
    desc: fill(insights.dashboard.attention.risk.desc, {
      topTitle: top.title,
      topScore: top.score,
      topId: top.id,
      topOwner: top.owner,
      topDue: top.dueDate,
    }),
    to: '/risk',
    toLabel: linkLabel,
  })
}

/**
 * 最终展示的关注项：先去掉「状态正常」的项（不是问题就不占位置），
 * 再按固定优先级取前 3 条。
 */
export const attentionItems: AttentionItem[] = candidates
  .filter((item) => item.severity !== 'good')
  .sort((a, b) => a.priority - b.priority)
  .slice(0, MAX_ATTENTION)
  .map(({ priority: _priority, ...item }) => item)
