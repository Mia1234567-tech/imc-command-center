// ============================================================
// 【重要声明】
// 本文件中的所有品牌、产品、金额、达人、账号、人名均为虚构，
// 仅用于个人作品集演示，不涉及任何真实企业、客户或业务数据。
// ============================================================

import type { AdItem } from '../types'

// ------------------------------------------------------------
// 投流项目数据：6 个付费投放账户
// 三个渠道的官方账号都靠投流放大内容，视频号只有原生推广一个账户
//
// 口径说明：
// - 曝光量 / 点击量 是全部曝光与点击里的付费部分（自然流量与达人内容不计入）；
// - 花费为虚构金额，只用于看「消耗了多少」，不与曝光做除法 ——
//   预算里混了达人、内容等多种成本，硬除会得出失真的 CPM / CPC；
// - 账户效率看 CTR 与消耗节奏，这两个指标不受金额口径影响。
// ------------------------------------------------------------

export const ads: AdItem[] = [
  {
    id: 'AD-01',
    account: '抖音 · 千川短视频加热',
    channel: 'douyin',
    type: '短视频加热',
    dailyBudget: 122_000,
    spend: 1_662_000,
    impressions: 48_000_000,
    clicks: 768_000,
    status: 'running',
  },
  {
    id: 'AD-02',
    account: '抖音 · 千川直播间引流',
    channel: 'douyin',
    type: '直播间引流',
    dailyBudget: 88_000,
    spend: 1_068_000,
    impressions: 28_000_000,
    clicks: 560_000,
    status: 'running',
  },
  {
    id: 'AD-03',
    account: '抖音 · 品牌号内容加热',
    channel: 'douyin',
    type: '内容加热',
    dailyBudget: 39_000,
    spend: 506_000,
    impressions: 17_500_000,
    clicks: 245_000,
    status: 'running',
  },
  {
    id: 'AD-04',
    account: '小红书 · 聚光信息流',
    channel: 'xiaohongshu',
    type: '信息流',
    dailyBudget: 73_000,
    spend: 1_362_000,
    impressions: 22_000_000,
    clicks: 330_000,
    status: 'running',
  },
  {
    id: 'AD-05',
    account: '小红书 · 聚光搜索',
    channel: 'xiaohongshu',
    type: '搜索广告',
    dailyBudget: 44_000,
    spend: 807_000,
    impressions: 6_500_000,
    clicks: 156_000,
    status: 'running',
  },
  {
    id: 'AD-08',
    account: '视频号 · 原生推广',
    channel: 'shipinhao',
    type: '原生推广',
    dailyBudget: 22_000,
    spend: 213_000,
    impressions: 9_800_000,
    clicks: 127_000,
    status: 'running',
  },
]
