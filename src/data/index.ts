// ============================================================
// 数据层统一出口
//
// 页面只需要 `import { channels, tasks, risks } from '../data'`，
// 不用关心每份数据具体放在哪个文件里。
// 想换数据时，改 src/data/ 下的对应文件即可，不用动页面。
// ============================================================

// —— 业务数据 ——
export { campaign, phases } from './campaign' // 项目数据
export { channels } from './channels' // 渠道数据
export { platformAudiences } from './audiences' // 人群画像数据
export { tasks } from './tasks' // 任务进度数据
export { kols } from './kols' // 达人项目数据
export { ads } from './ads' // 投流项目数据
export {
  budgetDimensions,
  dimensionBudgetTotal,
  dimensionSpentTotal,
  budgetReconciliation,
} from './budget' // 预算数据（10 个维度）
// ⚠️ 这里是「原始数据」。
// risks 没有 level 字段 —— 风险等级由风险分自动判定，
// 页面请从 utils/risk 取 judgedRisks（已带 score 与 level），不要直接用 risks。
export { risks } from './risk' // 风险数据
export { kpiTargets } from './kpi' // KPI 目标数据

// —— 结论与文案数据 ——
export {
  insights,
  budgetActions,
  budgetAlerts,
  kpiLevelGuide,
  riskResponsePlan,
} from './insights'

// —— 每日趋势数据（由上面数据自动推导生成）——
export {
  dates,
  dailyMetrics,
  dailyTotals,
  channelDaily,
  lastDays,
  weeklyTotals,
  totalSpend,
  totalImpressions,
  totalEngagements,
  totalClicks,
} from './daily'
