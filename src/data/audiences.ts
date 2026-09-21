// ============================================================
// 【重要声明】
// 本文件中的所有品牌、产品、金额、达人、账号、人名均为虚构，
// 仅用于个人作品集演示，不涉及任何真实企业、客户或业务数据。
// ============================================================

import type { PlatformAudience } from '../types'

// ------------------------------------------------------------
// 目标人群画像：分平台的人群资产标签与画像特征
//
// 人群规模取自 KPI 页对应指标的终期目标（TI / A3），
// 保证同一件事在全站只有一套数字。
// ------------------------------------------------------------

export const platformAudiences: PlatformAudience[] = [
  {
    channel: 'xiaohongshu',
    assetCode: 'TI',
    assetName: '目标人群（Target Insight）',
    framework: '小红书灵犀 · 人群资产',
    share: 0.274,
    size: 4_300_000,
    profile: [
      { label: '女性 25-34 岁', value: 0.72 },
      { label: '一二线城市', value: 0.58 },
      { label: '近 90 天搜索修护 / 抗初老', value: 0.44 },
      { label: '已互动未购买', value: 0.31 },
    ],
    note: '平台依据搜索与收藏行为识别出的品牌目标人群，是种草内容的第一触达对象。',
    strategy: '图文笔记铺量 + 搜索词卡位，内容主打成分对比与真实使用感受。',
  },
  {
    channel: 'douyin',
    assetCode: 'A3',
    assetName: '种草人群',
    framework: '巨量云图 · 5A 人群资产',
    share: 0.605,
    size: 9_500_000,
    profile: [
      { label: '女性 24-38 岁', value: 0.68 },
      { label: '三线及以上城市', value: 0.71 },
      { label: '近 30 天看过美妆内容 ≥3 次', value: 0.62 },
      { label: '直播间停留 >60 秒', value: 0.38 },
    ],
    note: '5A 模型中的深层种草人群，已被内容反复触达但尚未下单，是本次投放的主力转化池。',
    strategy: '短视频加热 + 直播间定向投放，配合限时满减做强转化。',
  },
  {
    channel: 'shipinhao',
    assetCode: '私域',
    assetName: '私域 + 相似人群',
    framework: '微信广告 · 人群包',
    share: 0.121,
    size: 1_900_000,
    profile: [
      { label: '公众号 / 企业微信存量用户', value: 0.35 },
      { label: '相似人群扩展（Lookalike）', value: 0.65 },
      { label: '女性 28-40 岁', value: 0.74 },
    ],
    note: '公众号粉丝、企业微信好友及相似人群扩展，用于私域承接与直播引流。',
    strategy: '原生推广 + 直播预约，重点验证私域转化链路是否跑通。',
  },
]
