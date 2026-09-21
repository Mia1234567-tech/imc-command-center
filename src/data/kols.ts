// ============================================================
// 【重要声明】
// 本文件中的所有品牌、产品、金额、达人、账号、人名均为虚构，
// 仅用于个人作品集演示，不涉及任何真实企业、客户或业务数据。
// ============================================================

import type { KolItem } from '../types'

// ------------------------------------------------------------
// 达人项目数据：8 位合作达人的报价、排期与效果
//
// 只有小红书与抖音有达人合作；
// 微信视频号为品牌官方账号自主运营，没有达人项目。
//
// impressions / engagements 为 null 表示尚未发布。
// 报价为虚构金额，只看「花了多少」，不与曝光做除法。
// ------------------------------------------------------------

export const kols: KolItem[] = [
  // —— 小红书 · 4 位 ——
  {
    id: 'K-01',
    name: '林小满',
    channel: 'xiaohongshu',
    tier: '头部',
    followers: 9_100_000,
    quote: 332_000,
    status: 'published',
    publishDate: '2026-09-08',
    impressions: 12_400_000,
    engagements: 620_000,
  },
  {
    id: 'K-02',
    name: '阿哲的护肤日记',
    channel: 'xiaohongshu',
    tier: '腰部',
    followers: 2_080_000,
    quote: 127_000,
    status: 'published',
    publishDate: '2026-09-11',
    impressions: 3_850_000,
    engagements: 178_000,
  },
  {
    id: 'K-03',
    name: '甜栗子',
    channel: 'xiaohongshu',
    tier: '腰部',
    followers: 1_553_000,
    quote: 88_000,
    status: 'published',
    publishDate: '2026-09-14',
    impressions: 2_760_000,
    engagements: 124_000,
  },
  {
    id: 'K-04',
    name: '周末不打烊',
    channel: 'xiaohongshu',
    tier: '尾部',
    followers: 420_000,
    quote: 22_000,
    status: 'scheduled',
    publishDate: '2026-09-23',
    impressions: null,
    engagements: null,
  },

  // —— 抖音 · 4 位 ——
  {
    id: 'K-05',
    name: '老赵说成分',
    channel: 'douyin',
    tier: '头部',
    followers: 15_850_000,
    quote: 449_000,
    status: 'published',
    publishDate: '2026-09-05',
    impressions: 21_500_000,
    engagements: 1_120_000,
  },
  {
    id: 'K-06',
    name: '楠楠子',
    channel: 'douyin',
    tier: '腰部',
    followers: 3_330_000,
    quote: 166_000,
    status: 'published',
    publishDate: '2026-09-09',
    impressions: 6_900_000,
    engagements: 322_000,
  },
  {
    id: 'K-07',
    name: '美妆小白鼠',
    channel: 'douyin',
    tier: '腰部',
    followers: 2_560_000,
    quote: 107_000,
    status: 'reviewing',
    publishDate: '2026-09-25',
    impressions: null,
    engagements: null,
  },
  {
    id: 'K-08',
    name: '大C的日常',
    channel: 'douyin',
    tier: '尾部',
    followers: 772_000,
    quote: 33_000,
    status: 'delayed',
    publishDate: '2026-09-18',
    impressions: null,
    engagements: null,
  },
]
