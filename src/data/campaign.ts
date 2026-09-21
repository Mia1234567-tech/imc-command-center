// ============================================================
// 【重要声明】
// 本文件中的所有品牌、产品、金额、达人、账号、人名均为虚构，
// 仅用于个人作品集演示，不涉及任何真实企业、客户或业务数据。
// ============================================================

import type { CampaignInfo, Channel, Phase } from '../types'
import { channels } from './channels'
import { platformAudiences } from './audiences'
import { isPlainObject, load, recordListValidator } from '../store/localStore'

// ------------------------------------------------------------
// 项目数据：Campaign 的基本信息、目标、执行阶段与核心传播信息
//
// 下面都是「默认演示数据」。后台「Campaign 管理」保存过之后，
// 优先使用统一数据源里的版本（见文件末尾）。
//
// ⚠️ 总量类数字（总预算、总花费、各项目标）**永远由渠道数据重新汇总**，
//    不会读统一数据源里的旧值 —— 保证一个数字只有一个来源。
// ------------------------------------------------------------

const defaultPhases: Phase[] = [
  {
    key: 'prep',
    name: '筹备期',
    startDate: '2026-08-01',
    endDate: '2026-08-14',
    status: 'done',
    progress: 100,
    focus: '策略定调、媒介排期、达人库筛选、首批素材交付',
  },
  {
    key: 'warmup',
    name: '预热期',
    startDate: '2026-08-15',
    endDate: '2026-08-31',
    status: 'done',
    progress: 100,
    focus: 'KOC 铺量种草、品牌号内容预热、搜索词卡位上线',
  },
  {
    key: 'burst',
    name: '爆发期',
    startDate: '2026-09-01',
    endDate: '2026-10-05',
    status: 'active',
    progress: 62,
    focus: '达人集中发布、千川信息流放量、头部达人直播专场',
  },
  {
    key: 'closing',
    name: '收尾期',
    startDate: '2026-10-06',
    endDate: '2026-10-31',
    status: 'todo',
    progress: 0,
    focus: '内容复盘与二次传播、结案报告、预算清算与效果归档',
  },
]

/** 执行阶段：后台保存过就优先用保存的版本（当前阶段会在后台切换） */
export const phases: Phase[] =
  load<Phase[]>(
    'phases',
    recordListValidator<Phase>(['key', 'name', 'startDate', 'endDate', 'status', 'progress']),
  ) ?? defaultPhases

const sumBy = (pick: (c: Channel) => number) =>
  channels.reduce((total, channel) => total + pick(channel), 0)

const defaultCampaign: CampaignInfo = {
  name: '「澜山」秋季修护系列 上市整合营销',
  brand: '澜山 LANSHAN（虚构品牌）',
  product: '修护精华露 / 修护面霜 / 紧致眼霜 三件套',
  code: 'IMC-2026-AUTUMN-01',
  owner: '品牌市场部 · Mia',
  team: '品牌 2 人 / 媒介 2 人 / 内容 3 人 / 数据 1 人',
  startDate: '2026-08-01',
  endDate: '2026-10-31',
  dataCutoff: '2026-09-20',
  status: '执行中 · 爆发期',
  objective:
    '以「秋季屏障修护」为核心卖点，通过小红书种草建立信任、抖音承接转化、视频号沉淀私域，实现新品上市首季度声量与销量的双目标。',
  description:
    '一次覆盖官方账号运营、达人内容合作、信息流投放与直播带货的完整整合营销 Campaign，周期 92 天，横跨 3 个内容平台（小红书 / 抖音 / 微信视频号），目标在预算范围内完成从认知到转化的全链路验证。',
  totalBudget: sumBy((c) => c.budget),
  totalSpent: sumBy((c) => c.spent),
  targetImpressions: sumBy((c) => c.targetImpressions),
  targetContent: sumBy((c) => c.targetContent),
  platformAudiences,
  keyMessages: [
    '秋季屏障修护，28 天可见改善',
    '核心成分：5% 神经酰胺 + 高纯度积雪草苷',
    '敏感肌可用，无酒精、无香精、无色素',
  ],
}

/**
 * 后台「Campaign 管理」保存的内容。
 * 只取明确列出来的这几个字段：一个字段一个来源，避免被旧数据里的派生值污染。
 */
const storedCampaign = load<Partial<CampaignInfo>>(
  'campaign',
  (value): value is Partial<CampaignInfo> => isPlainObject(value),
)

const pickText = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim() ? value : fallback

export const campaign: CampaignInfo = {
  name: pickText(storedCampaign?.name, defaultCampaign.name),
  brand: pickText(storedCampaign?.brand, defaultCampaign.brand),
  product: pickText(storedCampaign?.product, defaultCampaign.product),
  code: pickText(storedCampaign?.code, defaultCampaign.code),
  owner: pickText(storedCampaign?.owner, defaultCampaign.owner),
  team: pickText(storedCampaign?.team, defaultCampaign.team),
  startDate: pickText(storedCampaign?.startDate, defaultCampaign.startDate),
  endDate: pickText(storedCampaign?.endDate, defaultCampaign.endDate),
  dataCutoff: pickText(storedCampaign?.dataCutoff, defaultCampaign.dataCutoff),
  status: pickText(storedCampaign?.status, defaultCampaign.status),
  objective: pickText(storedCampaign?.objective, defaultCampaign.objective),
  description: pickText(storedCampaign?.description, defaultCampaign.description),
  // —— 以下永远由渠道数据重新汇总，不从统一数据源读取 ——
  totalBudget: sumBy((channel) => channel.budget),
  totalSpent: sumBy((channel) => channel.spent),
  targetImpressions: sumBy((channel) => channel.targetImpressions),
  targetContent: sumBy((channel) => channel.targetContent),
  platformAudiences,
  keyMessages: defaultCampaign.keyMessages,
}
