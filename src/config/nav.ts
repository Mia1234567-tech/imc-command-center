import type { LucideIcon } from 'lucide-react'
import {
  Gauge,
  LayoutDashboard,
  ListChecks,
  Settings2,
  ShieldAlert,
  Target,
  Wallet,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  zh: string
  desc: string
  icon: LucideIcon
}

// 左侧导航。想加页面就在这里加一条，侧边栏和标题栏会自动同步。
export const navItems: NavItem[] = [
  {
    to: '/',
    label: 'Dashboard',
    zh: '总览',
    desc: '整体表现、预算消耗与预警摘要',
    icon: LayoutDashboard,
  },
  {
    to: '/campaign',
    label: 'Campaign Overview',
    zh: 'Campaign 总览',
    desc: '目标、人群、节奏与渠道布局',
    icon: Target,
  },
  {
    to: '/execution',
    label: 'Project Execution',
    zh: '项目执行',
    desc: '任务进度、达人项目与投流项目',
    icon: ListChecks,
  },
  {
    to: '/budget',
    label: 'Budget',
    zh: '预算管理',
    desc: '预算分配、消耗进度与超支预警',
    icon: Wallet,
  },
  {
    to: '/kpi',
    label: 'KPI',
    zh: 'KPI 达成',
    desc: '目标值 vs 实际值与分渠道拆解',
    icon: Gauge,
  },
  {
    to: '/risk',
    label: 'Risk',
    zh: '风险分析',
    desc: '风险清单、等级矩阵与应对措施',
    icon: ShieldAlert,
  },
]

/**
 * 后台管理导航。
 * 单独一组，渲染在侧边栏最下方 —— 前台页面不看它，也不会影响原有导航。
 */
export const adminNavItems: NavItem[] = [
  {
    to: '/admin',
    label: 'Admin',
    zh: '后台管理',
    desc: '编辑演示数据，前台同步读取',
    icon: Settings2,
  },
]
