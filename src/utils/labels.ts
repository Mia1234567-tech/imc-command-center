import type { Tone } from '../components/ui/Badge'
import type {
  AdStatus,
  ChannelKey,
  KolStatus,
  PhaseKey,
  Priority,
  RiskLevel,
  RiskStatus,
  TaskStatus,
} from '../types'

// 所有「状态 → 中文标签 + 颜色」的映射集中在这里，避免各页面各写一套

export const channelNames: Record<ChannelKey, string> = {
  xiaohongshu: '小红书',
  douyin: '抖音',
  shipinhao: '微信视频号',
}

export const phaseNames: Record<PhaseKey, string> = {
  prep: '筹备期',
  warmup: '预热期',
  burst: '爆发期',
  closing: '收尾期',
}

export const taskStatusMeta: Record<TaskStatus, { label: string; tone: Tone }> = {
  done: { label: '已完成', tone: 'good' },
  active: { label: '进行中', tone: 'info' },
  delayed: { label: '延期', tone: 'bad' },
  todo: { label: '未开始', tone: 'idle' },
}

export const kolStatusMeta: Record<KolStatus, { label: string; tone: Tone }> = {
  published: { label: '已发布', tone: 'good' },
  reviewing: { label: '审核中', tone: 'warn' },
  scheduled: { label: '待发布', tone: 'info' },
  delayed: { label: '已延期', tone: 'bad' },
}

export const adStatusMeta: Record<AdStatus, { label: string; tone: Tone }> = {
  running: { label: '投放中', tone: 'good' },
  paused: { label: '已暂停', tone: 'warn' },
  ended: { label: '已结束', tone: 'idle' },
}

/**
 * 风险等级展示信息。
 * ⚠️ 等级不是手写的，由「概率 × 影响」的风险分自动判定（规则见 utils/risk.ts）。
 * label 是紧凑场合用的短标签，full 是完整名称。
 */
export const riskLevelMeta: Record<
  RiskLevel,
  { label: string; full: string; tone: Tone; color: string; order: number }
> = {
  high: { label: '重点', full: '重点风险', tone: 'bad', color: '#e5484d', order: 0 },
  medium: { label: '中等', full: '中等风险', tone: 'warn', color: '#f5a524', order: 1 },
  low: { label: '一般', full: '一般风险', tone: 'info', color: '#3b82f6', order: 2 },
}

export const riskStatusMeta: Record<RiskStatus, { label: string; tone: Tone }> = {
  open: { label: '待处理', tone: 'bad' },
  handling: { label: '处理中', tone: 'warn' },
  monitoring: { label: '监控中', tone: 'info' },
  resolved: { label: '已关闭', tone: 'good' },
}

export const priorityMeta: Record<Priority, { label: string; tone: Tone }> = {
  high: { label: '高', tone: 'bad' },
  medium: { label: '中', tone: 'warn' },
  low: { label: '低', tone: 'idle' },
}

export const phaseStatusMeta: Record<'done' | 'active' | 'todo', { label: string; tone: Tone }> = {
  done: { label: '已结束', tone: 'good' },
  active: { label: '进行中', tone: 'info' },
  todo: { label: '未开始', tone: 'idle' },
}

/** 达成率 / 完成率 → 颜色，>=95% 视为达标 */
export function rateTone(ratio: number): Tone {
  if (ratio >= 0.95) return 'good'
  if (ratio >= 0.8) return 'warn'
  return 'bad'
}

/**
 * KPI 达成率相对「时间进度」的健康度。
 *
 * 达成率会随时间推进自然增长，所以判断快慢要跟时间进度比，
 * 不能直接和 100% 比 —— 否则项目执行到中段时，所有指标都会被标成红色，
 * 既不客观也看不出谁真的落后。
 */
export function paceTone(rate: number, time: number): Tone {
  const gap = rate - time
  if (gap >= 0.03) return 'good'
  if (gap >= -0.05) return 'warn'
  return 'bad'
}

/**
 * 关注项的严重程度。
 * 用于 Dashboard「当前需要关注」列表里的程度标签。
 */
export const attentionSeverityMeta: Record<
  'bad' | 'warn' | 'good',
  { label: string; tone: Tone }
> = {
  bad: { label: '需立即处理', tone: 'bad' },
  warn: { label: '需要关注', tone: 'warn' },
  good: { label: '状态正常', tone: 'good' },
}

/** 预算执行是否超前（正值越大越危险） */
export function gapTone(gapPp: number): Tone {
  if (gapPp > 0.08) return 'bad'
  if (gapPp > 0) return 'warn'
  return 'good'
}
