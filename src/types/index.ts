// ============================================================
// 全站共用的数据结构定义
// 只要这里改一个字段名，用到它的地方都会立刻报错提醒，不会静默出错
// ============================================================

export type ChannelKey = 'xiaohongshu' | 'douyin' | 'shipinhao'

export type PhaseKey = 'prep' | 'warmup' | 'burst' | 'closing'

export type TaskStatus = 'done' | 'active' | 'delayed' | 'todo'

export type KolStatus = 'published' | 'reviewing' | 'scheduled' | 'delayed'

export type AdStatus = 'running' | 'paused' | 'ended'

export type RiskLevel = 'high' | 'medium' | 'low'

export type RiskStatus = 'open' | 'handling' | 'monitoring' | 'resolved'

export type Priority = 'high' | 'medium' | 'low'

export type Trend = 'up' | 'down' | 'flat'

/** 渠道 */
export interface Channel {
  key: ChannelKey
  name: string
  shortName: string
  color: string
  /** 渠道在 Campaign 中承担的角色 */
  role: string
  /** 渠道特征一句话 */
  note: string
  budget: number
  spent: number
  impressions: number
  engagements: number
  clicks: number
  /** 该渠道是否有达人合作（微信视频号目前没有） */
  kolCooperation: boolean
  /** 产出的内容数量（篇 / 条） */
  contentCount: number
  /** 渠道曝光终期目标（全站曝光目标按平台拆分而来） */
  targetImpressions: number
  /** 渠道内容产出目标（篇 / 条） */
  targetContent: number
}

/** Campaign 基本信息 */
export interface CampaignInfo {
  name: string
  brand: string
  product: string
  code: string
  owner: string
  team: string
  startDate: string
  endDate: string
  /** 数据截止日 */
  dataCutoff: string
  status: string
  objective: string
  description: string
  totalBudget: number
  totalSpent: number
  targetImpressions: number
  targetContent: number
  keyMessages: string[]
  platformAudiences: PlatformAudience[]
}

/**
 * 分平台的目标人群画像。
 * 各平台有自己的人群资产标签体系，例如小红书的 TI 人群、抖音的 5A 人群资产。
 */
export interface PlatformAudience {
  channel: ChannelKey
  /** 平台人群标签代码，例如 TI / A3 / DMP */
  assetCode: string
  /** 标签的中文名称 */
  assetName: string
  /** 该标签所属的人群资产体系 */
  framework: string
  /** 占本次 Campaign 目标人群总规模的比例 */
  share: number
  /** 人群规模（人） */
  size: number
  /** 画像特征及其占比 */
  profile: { label: string; value: number }[]
  /** 这个人群是什么 */
  note: string
  /** 在这个人群上做什么 */
  strategy: string
}

/** 阶段时间轴 */
export interface Phase {
  key: PhaseKey
  name: string
  startDate: string
  endDate: string
  status: 'done' | 'active' | 'todo'
  progress: number
  focus: string
}

/** 执行任务 */
export interface TaskItem {
  id: string
  name: string
  channel: ChannelKey | 'cross'
  phase: PhaseKey
  owner: string
  startDate: string
  endDate: string
  /** 0 - 100 */
  progress: number
  status: TaskStatus
  priority: Priority
}

/** 达人项目 */
export interface KolItem {
  id: string
  name: string
  channel: ChannelKey
  /** 头部 / 腰部 / 尾部 */
  tier: string
  followers: number
  quote: number
  status: KolStatus
  publishDate: string
  /** 尚未发布的为 null */
  impressions: number | null
  engagements: number | null
}

/** 投流项目 */
export interface AdItem {
  id: string
  account: string
  channel: ChannelKey
  type: string
  dailyBudget: number
  spend: number
  impressions: number
  clicks: number
  status: AdStatus
}

/**
 * 预算维度。
 * 业务口径尚未确认，维度名称统一使用 Dimension 01 ~ Dimension 10；
 * 只保留「预算额」与「已使用额」两个原始数字，
 * 剩余预算、使用率、占比全部由页面按汇总结果自动算出来。
 */
export interface BudgetDimension {
  key: string
  name: string
  budget: number
  spent: number
}

/** KPI 指标代码（5 项，与各平台后台的运营指标口径一致） */
export type KpiKey = 'impressions' | 'clicksEngagements' | 'a3' | 'ti' | 'search'

/**
 * KPI 的目标设定（数据层）。
 * 只描述「目标是什么」；实际值优先取这里登记的 actual，
 * 没登记的（曝光、点击互动）由 src/utils/kpi.ts 从每日趋势自动累加。
 */
export interface KpiTarget {
  key: KpiKey
  name: string
  unit: string
  target: number
  /** 权重 0 - 1 */
  weight: number
  /** 该指标越大越好还是越小越好 */
  better: 'high' | 'low'
  owner: string
  note: string
  /** 平台后台登记的「本期累计」；不填表示由每日趋势自动累加 */
  actual?: number
}

/** KPI 指标（目标 + 实际值 + 趋势，供页面直接渲染） */
export interface KpiItem extends KpiTarget {
  actual: number
  /** 每日趋势，用于画迷你折线（非量值类指标可以不填） */
  trend?: number[]
}

/**
 * 风险条目。
 *
 * 注意：这里**没有** level 字段 —— 风险等级不手写，
 * 由「概率 × 影响」的风险分自动判定，规则见 src/utils/risk.ts。
 */
export interface RiskItem {
  id: string
  title: string
  category: string
  /** 发生概率 1 - 5 */
  probability: number
  /** 影响程度 1 - 5 */
  impact: number
  status: RiskStatus
  owner: string
  mitigation: string
  openedAt: string
  dueDate: string
}

/** 风险条目 + 自动判定出来的风险分与等级 */
export interface RiskScored extends RiskItem {
  /** 风险分 = 概率 × 影响（1 - 25） */
  score: number
  /** 由风险分自动判定的等级 */
  level: RiskLevel
}

/** 单日单渠道明细 */
export interface DailyMetric {
  date: string
  channel: ChannelKey
  spend: number
  impressions: number
  engagements: number
  clicks: number
}

/** 全渠道汇总的单日数据 */
export interface DailyTotal {
  date: string
  spend: number
  impressions: number
  engagements: number
  clicks: number
}
