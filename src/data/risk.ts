// ============================================================
// 【重要声明】
// 本文件中的所有品牌、产品、金额、达人、账号、人名均为虚构，
// 仅用于个人作品集演示，不涉及任何真实企业、客户或业务数据。
// ============================================================

import type { RiskItem } from '../types'
import { load, recordListValidator } from '../store/localStore'

// ------------------------------------------------------------
// 风险数据：12 项已登记风险
//
// ⚠️ 这里**故意不写等级**。
// 风险等级由「概率 × 影响」的风险分自动判定（规则见 src/utils/risk.ts），
// 所以数据层只登记两个输入值：发生概率 probability 与影响程度 impact，
// 等级、分数、优先级排序、矩阵位置全部由代码算出来。
// 想改某个风险的等级，改概率或影响即可，不要在这里加 level 字段。
// ------------------------------------------------------------

const defaultRisks: RiskItem[] = [
  {
    id: 'R-01',
    title: '投入强度大于产出强度：预算执行率明显快于 KPI 加权达成率',
    category: '目标达成',
    probability: 4,
    impact: 4,
    status: 'handling',
    owner: '李××',
    mitigation:
      '按周复盘每个投放账户的曝光产出与素材 CTR，把预算从低效账户转向高效账户；提高品牌号内容供给频次，同步优化人群包圈选条件。',
    openedAt: '2026-09-11',
    dueDate: '2026-09-26',
  },
  {
    id: 'R-02',
    title: '预算执行率 74.3%，超出时间进度 18.9 个百分点，存在超支风险',
    category: '预算',
    probability: 5,
    impact: 4,
    status: 'handling',
    owner: '李××',
    mitigation:
      '暂停 Dimension 03 的新增支出，超出部分在后续申请中扣减；达人尾款改按效果分期支付；收尾期以自然流量与达人二次传播为主，日均花费目标压到 ¥84,000 以内。',
    openedAt: '2026-09-14',
    dueDate: '2026-10-10',
  },
  {
    id: 'R-03',
    title: '小红书爆文率低于预期，头部内容仅 4 篇达标（目标 12 篇）',
    category: '渠道表现',
    probability: 4,
    impact: 3,
    status: 'handling',
    owner: '王××',
    mitigation:
      '追加 8 位腰部达人做 AB 测试，统一优化笔记前 3 秒钩子；对已发布低效笔记追加评论区维护与关键词埋词。',
    openedAt: '2026-09-09',
    dueDate: '2026-10-02',
  },
  {
    id: 'R-04',
    title: '达人内容交付延期，3 位头部达人排期后移 5-7 天',
    category: '达人合作',
    probability: 3,
    impact: 3,
    status: 'handling',
    owner: '赵××',
    mitigation:
      '签订补充排期确认单，逾期按合同扣减 10% 服务费；同时启用备选达人池，避免爆发期内容断档。',
    openedAt: '2026-09-08',
    dueDate: '2026-09-28',
  },
  {
    id: 'R-05',
    title: '视频号数据回传口径未打通，曝光与互动无法按内容归因',
    category: '数据基建',
    probability: 4,
    impact: 2,
    status: 'open',
    owner: '陈××',
    mitigation:
      '补齐原生推广与直播间的数据回传参数；由数据组在 10 月 1 日前交付分渠道数据看板，先把曝光与互动拆到单条内容。',
    openedAt: '2026-09-10',
    dueDate: '2026-10-01',
  },
  {
    id: 'R-06',
    title: '竞品同期上新，抢占同款关键词搜索结果首位',
    category: '市场竞争',
    probability: 3,
    impact: 4,
    status: 'monitoring',
    owner: '周××',
    mitigation:
      '加投品牌专区与搜索结果卡位，调整投放词包增加长尾防御词；监测竞品价格与主推卖点，48 小时内同步调整话术。',
    openedAt: '2026-09-12',
    dueDate: '2026-10-15',
  },
  {
    id: 'R-07',
    title: '周会数据口径不一致，周报数据返工 2 次',
    category: '协作流程',
    probability: 2,
    impact: 2,
    status: 'resolved',
    owner: 'Mia',
    mitigation:
      '统一以数据看板为唯一口径，冻结日报模板；新增字段需经数据组确认后统一上线。',
    openedAt: '2026-09-02',
    dueDate: '2026-09-16',
  },
  {
    id: 'R-08',
    title: '小红书目标人群（TI）积累速度最慢，完成率是 5 项核心指标里最低的一项',
    category: '人群资产',
    probability: 4,
    impact: 3,
    status: 'handling',
    owner: '王××',
    mitigation:
      '优化 TI 人群包的标签组合，适当放宽过于苛刻的条件；加大搜索场景投放与品牌词卡位；把 TI 增长纳入周度复盘，与内容选题联动。',
    openedAt: '2026-09-18',
    dueDate: '2026-10-08',
  },
  {
    id: 'R-09',
    title: '跨渠道核心文案触碰道德、性别或政治红线，引发品牌形象危机',
    category: '品牌形象与合规',
    probability: 1,
    impact: 5,
    status: 'monitoring',
    owner: '周××',
    mitigation:
      '实行一票否决制：所有多渠道发布的核心文案必须通过法务与合规终审后方可上线，终审记录留档备查。',
    openedAt: '2026-09-15',
    dueDate: '2026-10-20',
  },
  {
    id: 'R-10',
    title: '核心 KOL / 代言人在 Campaign 执行期间人设崩塌或爆出负面丑闻',
    category: '创意与财务投资回报率',
    probability: 3,
    impact: 5,
    status: 'handling',
    owner: '赵××',
    mitigation:
      '合同必须包含道德条款（Morality Clause），明确违约赔付与素材下架义务；同时储备第二梯队 KOL，随时承接流量缺口。',
    openedAt: '2026-09-13',
    dueDate: '2026-10-12',
  },
  {
    id: 'R-11',
    title: '线上大促广告已铺开，但供应链或落地页技术系统崩溃（如 H5 活动页打不开）',
    category: '跨渠道协同运营',
    probability: 3,
    impact: 4,
    status: 'handling',
    owner: '陈××',
    mitigation:
      '提前 48 小时进行全链路压力测试，覆盖 H5 活动页与下单链路；准备技术容灾方案（Plan B 静态页面），并明确切换与回滚的责任人。',
    openedAt: '2026-09-16',
    dueDate: '2026-10-05',
  },
  {
    id: 'R-12',
    title: '社媒信息流广告与线下站点促销折扣不一致，引发用户举报',
    category: '用户体验与认知',
    probability: 4,
    impact: 3,
    status: 'open',
    owner: '王××',
    mitigation:
      '建立统一的跨渠道价格与促销数据库，所有渠道素材统一取数；客服团队提前下发多渠道常见问题解答（FAQ），统一口径应答。',
    openedAt: '2026-09-17',
    dueDate: '2026-10-12',
  },
]

/**
 * 优先使用后台保存过的风险；没有保存过就用上面的默认数据。
 * 注意：等级仍然由 utils/risk.ts 按「概率 × 影响」自动判定，数据里没有 level 字段。
 */
export const risks: RiskItem[] =
  load<RiskItem[]>(
    'risks',
    recordListValidator<RiskItem>([
      'id',
      'title',
      'category',
      'probability',
      'impact',
      'status',
      'owner',
      'mitigation',
      'openedAt',
      'dueDate',
    ]),
  ) ?? defaultRisks

