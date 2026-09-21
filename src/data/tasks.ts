// ============================================================
// 【重要声明】
// 本文件中的所有品牌、产品、金额、达人、账号、人名均为虚构，
// 仅用于个人作品集演示，不涉及任何真实企业、客户或业务数据。
// ============================================================

import type { TaskItem } from '../types'
import { load, recordListValidator } from '../store/localStore'

// ------------------------------------------------------------
// 任务进度数据：项目执行的 15 项任务
// progress 为 0-100 的完成度，status 取 done / active / delayed / todo
//
// 这里只是「默认演示数据」。后台保存过任务后，会优先读取统一数据源里的版本。
// ------------------------------------------------------------

const defaultTasks: TaskItem[] = [
  // 筹备期
  {
    id: 'T-01',
    name: 'Campaign 策略与人群洞察定稿',
    channel: 'cross',
    phase: 'prep',
    owner: 'Mia',
    startDate: '2026-08-01',
    endDate: '2026-08-06',
    progress: 100,
    status: 'done',
    priority: 'high',
  },
  {
    id: 'T-02',
    name: '三渠道媒介排期与预算分配确认',
    channel: 'cross',
    phase: 'prep',
    owner: '李××',
    startDate: '2026-08-04',
    endDate: '2026-08-10',
    progress: 100,
    status: 'done',
    priority: 'high',
  },
  {
    id: 'T-03',
    name: '达人库搭建与筛选（180 位入库）',
    channel: 'cross',
    phase: 'prep',
    owner: '赵××',
    startDate: '2026-08-05',
    endDate: '2026-08-12',
    progress: 100,
    status: 'done',
    priority: 'high',
  },
  {
    id: 'T-04',
    name: '主视觉与首批素材交付（36 条）',
    channel: 'cross',
    phase: 'prep',
    owner: '王××',
    startDate: '2026-08-07',
    endDate: '2026-08-14',
    progress: 100,
    status: 'done',
    priority: 'medium',
  },

  // 预热期
  {
    id: 'T-05',
    name: '小红书 KOC 种草铺量（目标 320 篇）',
    channel: 'xiaohongshu',
    phase: 'warmup',
    owner: '王××',
    startDate: '2026-08-15',
    endDate: '2026-08-31',
    progress: 100,
    status: 'done',
    priority: 'high',
  },
  {
    id: 'T-06',
    name: '抖音品牌号内容预热（12 条）',
    channel: 'douyin',
    phase: 'warmup',
    owner: '张××',
    startDate: '2026-08-18',
    endDate: '2026-08-31',
    progress: 100,
    status: 'done',
    priority: 'medium',
  },
  {
    id: 'T-07',
    name: '品牌专区与搜索词卡位上线',
    channel: 'cross',
    phase: 'warmup',
    owner: '周××',
    startDate: '2026-08-20',
    endDate: '2026-08-28',
    progress: 100,
    status: 'done',
    priority: 'medium',
  },
  {
    id: 'T-08',
    name: '达人首批内容发布（24 位）',
    channel: 'cross',
    phase: 'warmup',
    owner: '赵××',
    startDate: '2026-08-22',
    endDate: '2026-08-31',
    progress: 100,
    status: 'done',
    priority: 'high',
  },

  // 爆发期
  {
    id: 'T-09',
    name: '抖音千川信息流放量',
    channel: 'douyin',
    phase: 'burst',
    owner: '张××',
    startDate: '2026-09-01',
    endDate: '2026-10-05',
    progress: 78,
    status: 'active',
    priority: 'high',
  },
  {
    id: 'T-10',
    name: '小红书腰部达人内容投放（36 位）',
    channel: 'xiaohongshu',
    phase: 'burst',
    owner: '王××',
    startDate: '2026-09-01',
    endDate: '2026-10-02',
    progress: 64,
    status: 'active',
    priority: 'high',
  },
  {
    id: 'T-11',
    name: '头部达人直播专场（4 场）',
    channel: 'cross',
    phase: 'burst',
    owner: '赵××',
    startDate: '2026-09-05',
    endDate: '2026-10-05',
    progress: 50,
    status: 'active',
    priority: 'high',
  },
  {
    id: 'T-13',
    name: '视频号直播带货试播（6 场）',
    channel: 'shipinhao',
    phase: 'burst',
    owner: '陈××',
    startDate: '2026-09-08',
    endDate: '2026-10-05',
    progress: 41,
    status: 'delayed',
    priority: 'medium',
  },
  {
    id: 'T-14',
    name: '达人内容二次混剪投放',
    channel: 'douyin',
    phase: 'burst',
    owner: '张××',
    startDate: '2026-09-10',
    endDate: '2026-10-05',
    progress: 55,
    status: 'delayed',
    priority: 'high',
  },

  // 收尾期
  {
    id: 'T-15',
    name: '达人内容复盘与二次传播',
    channel: 'cross',
    phase: 'closing',
    owner: '王××',
    startDate: '2026-10-06',
    endDate: '2026-10-20',
    progress: 0,
    status: 'todo',
    priority: 'medium',
  },
  {
    id: 'T-16',
    name: 'Campaign 结案报告与 KPI 复盘',
    channel: 'cross',
    phase: 'closing',
    owner: 'Mia',
    startDate: '2026-10-20',
    endDate: '2026-10-31',
    progress: 0,
    status: 'todo',
    priority: 'high',
  },
]

/**
 * 优先使用后台保存过的任务；没有保存过就用上面的默认数据。
 * 校验不通过（数据被改坏 / 版本不符）时也会自动回退，不会让页面白屏。
 */
export const tasks: TaskItem[] =
  load<TaskItem[]>(
    'tasks',
    recordListValidator<TaskItem>([
      'id',
      'name',
      'channel',
      'phase',
      'owner',
      'startDate',
      'endDate',
      'progress',
      'status',
      'priority',
    ]),
  ) ?? defaultTasks

