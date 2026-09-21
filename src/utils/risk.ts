import type { Tone } from '../components/ui/Badge'
import { risks } from '../data/risk'
import type { RiskLevel, RiskScored } from '../types'

// ============================================================
// 风险自动判定
//
// 规则（业务口径）：
//   风险分 Risk Score = 发生概率（1-5）× 影响程度（1-5），满分 25
//   分数越高越危险，按分数自动归入三档：
//
//     ≥ 15 分        重点风险  High   —— 必须制定应急预案
//     7 ~ 14 分      中等风险  Medium —— 需要明确的缓释动作与跟踪机制
//     ≤ 6 分         一般风险  Low    —— 保持监控
//
// ⚠️ 阈值只在这里定义一次。
// 想改成「超过 15 分才算重点风险」，把 RISK_HIGH_MIN 改成 16 即可，全站同步生效。
// ============================================================

/** 重点风险的分数下限：风险分 ≥ 此值即判为重点风险 */
export const RISK_HIGH_MIN = 15
/** 中等风险的分数下限：风险分 ≥ 此值（且低于重点阈值）判为中等风险 */
export const RISK_MEDIUM_MIN = 7
/** 风险分满分：概率 5 × 影响 5 */
export const RISK_SCORE_MAX = 25
/** 两个输入项的取值上限，用于校验与文案 */
export const RISK_INPUT_MAX = 5

/** 风险分 = 概率 × 影响 */
export function riskScore(risk: { probability: number; impact: number }): number {
  return risk.probability * risk.impact
}

/** 按风险分自动判定等级 —— 全站唯一的判定入口 */
export function judgeRiskLevel(score: number): RiskLevel {
  if (score >= RISK_HIGH_MIN) return 'high'
  if (score >= RISK_MEDIUM_MIN) return 'medium'
  return 'low'
}

/**
 * 登记数据 + 自动判定结果。
 * 页面一律用这个，不要直接用手写的 risks —— 等级、分数都从这里来。
 */
export const judgedRisks: RiskScored[] = risks.map((risk) => {
  const score = riskScore(risk)
  return { ...risk, score, level: judgeRiskLevel(score) }
})

/** 按等级统计项数 */
export const riskLevelCounts: Record<RiskLevel, number> = {
  high: judgedRisks.filter((r) => r.level === 'high').length,
  medium: judgedRisks.filter((r) => r.level === 'medium').length,
  low: judgedRisks.filter((r) => r.level === 'low').length,
}

/** 未关闭的风险 */
export const openRisks = judgedRisks.filter((r) => r.status !== 'resolved')

/**
 * 三种等级的判定说明，用于页面上的「自动判定规则」卡片。
 * 分数区间由上面的阈值算出来，改阈值这段说明会跟着变，不会写死。
 */
export const riskLevelRules: Array<{
  level: RiskLevel
  name: string
  range: string
  tone: Tone
  desc: string
}> = [
  {
    level: 'high',
    name: '重点风险',
    range: `${RISK_HIGH_MIN} ~ ${RISK_SCORE_MAX} 分`,
    tone: 'bad',
    desc: '必须制定应急预案，责任人限期闭环，并进入周会重点议题。',
  },
  {
    level: 'medium',
    name: '中等风险',
    range: `${RISK_MEDIUM_MIN} ~ ${RISK_HIGH_MIN - 1} 分`,
    tone: 'warn',
    desc: '需要有明确的缓释动作与跟踪机制，按周更新处理进展。',
  },
  {
    level: 'low',
    name: '一般风险',
    range: `1 ~ ${RISK_MEDIUM_MIN - 1} 分`,
    tone: 'info',
    desc: '保持监控即可；一旦概率或影响发生变化，重新评分并升级处理。',
  },
]
