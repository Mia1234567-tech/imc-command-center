import { Gauge, ListChecks, RotateCcw, ShieldAlert, Target, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Card, CardBody, CardHeader, PageHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button, Notice } from '../../components/admin/Form'
import { budgetDimensions, campaign, kpiTargets, phases, risks, tasks } from '../../data'
import { clearAll, readMeta, storeAvailable, type CollectionKey } from '../../store/localStore'
import { money, moneyShort, num } from '../../utils/format'

// ============================================================
// 后台首页
//
// 一句话定位：这里是「改数据」的地方，前台六个页面是「看数据」的地方。
// 改完保存 → 数据进入统一数据源 → 前台重新读一遍 → 全站数字同步。
// ============================================================

const KEY_LABEL: Record<CollectionKey, string> = {
  campaign: 'Campaign 信息',
  phases: '执行阶段',
  budgetDimensions: '预算维度',
  kpiTargets: 'KPI 指标',
  tasks: '任务',
  risks: '风险',
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const dimensionBudget = budgetDimensions.reduce((sum, item) => sum + item.budget, 0)
const dimensionSpent = budgetDimensions.reduce((sum, item) => sum + item.spent, 0)
const activePhase = phases.find((phase) => phase.status === 'active')

interface Entry {
  to: string
  icon: LucideIcon
  title: string
  desc: string
  stat: string
}

const entries: Entry[] = [
  {
    to: '/admin/campaign',
    icon: Target,
    title: 'Campaign 管理',
    desc: '名称、ID、周期、当前阶段、目标与负责人',
    stat: `${campaign.code} · ${activePhase?.name ?? '未设置阶段'}`,
  },
  {
    to: '/admin/execution',
    icon: ListChecks,
    title: '项目执行管理',
    desc: '任务的新增、编辑与删除（阶段 / 渠道 / 完成率 / 状态）',
    stat: `${tasks.length} 项任务`,
  },
  {
    to: '/admin/budget',
    icon: Wallet,
    title: '预算管理',
    desc: '10 个维度的预算与已使用，剩余与使用率自动计算',
    stat: `总预算 ${moneyShort(dimensionBudget)}`,
  },
  {
    to: '/admin/kpi',
    icon: Gauge,
    title: 'KPI 管理',
    desc: '5 项指标的名称、当前值与目标值，完成率自动计算',
    stat: `${kpiTargets.length} 项指标`,
  },
  {
    to: '/admin/risk',
    icon: ShieldAlert,
    title: '风险管理',
    desc: '风险的新增、编辑与删除，等级按概率 × 影响自动判定',
    stat: `${risks.length} 项风险`,
  },
]

export default function AdminHome() {
  const [meta, setMeta] = useState(() => readMeta())
  const [confirmReset, setConfirmReset] = useState(false)
  const available = storeAvailable()

  /** 恢复默认演示数据：清掉本机保存的改动，回到代码里的 Demo 初始数据 */
  const onReset = () => {
    clearAll()
    setMeta(readMeta())
    window.location.reload()
  }

  return (
    <>
      <PageHeader
        zh="后台管理"
        en="Admin"
        desc="这里是「改数据」的地方：改完保存，前台 Dashboard / Campaign / Execution / Budget / KPI / Risk 会读取统一数据源里的最新数据。"
        extra={
          <div className="flex items-center gap-2">
            <Badge tone="warn">Demo Data · 演示数据</Badge>
            <Badge tone="idle">纯前端 Demo · 无需登录</Badge>
          </div>
        }
      />

      {/* 数据状态 */}
      <Card>
        <CardHeader
          title="数据状态"
          subtitle="这里保存的内容会写入浏览器的本地存储，刷新与重开页面后依然生效"
          extra={
            meta.dirtyKeys.length ? (
              <Badge tone="info">已修改 {meta.dirtyKeys.length} 处</Badge>
            ) : (
              <Badge tone="good">使用默认演示数据</Badge>
            )
          }
        />
        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3">
              <div className="text-[11px] text-slate-500">当前 Campaign</div>
              <div className="mt-1.5 text-[12.5px] leading-5 font-medium text-slate-800">
                {campaign.name}
              </div>
              <div className="mt-1.5 text-[11px] text-slate-500">{campaign.status}</div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3">
              <div className="text-[11px] text-slate-500">数据更新时间</div>
              <div className="tabular mt-1.5 text-[12.5px] leading-5 font-medium text-slate-800">
                {meta.savedAt ? formatTime(meta.savedAt) : '尚未修改'}
              </div>
              <div className="mt-1.5 text-[11px] text-slate-500">
                {meta.dirtyKeys.length
                  ? `涉及：${meta.dirtyKeys.map((key) => KEY_LABEL[key]).join('、')}`
                  : '全部为代码里的默认演示数据'}
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3">
              <div className="text-[11px] text-slate-500">预算口径</div>
              <div className="tabular mt-1.5 text-[12.5px] leading-5 font-medium text-slate-800">
                维度 {money(dimensionBudget)} / 渠道 {money(campaign.totalBudget)}
              </div>
              <div className="mt-1.5 text-[11px] text-slate-500">
                维度已使用 {num(dimensionSpent)} 元
              </div>
            </div>
          </div>

          {!available ? (
            <div className="mt-4">
              <Notice tone="warn">
                当前环境（例如直接用 file:// 打开的单文件演示版）不允许写入浏览器存储，
                保存不会生效。请用 <b>npm run dev</b> 打开的地址，或线上部署后的地址来编辑数据。
              </Notice>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
            <p className="text-[11px] leading-5 text-slate-400">
              数据只保存在<b>当前这台电脑的这个浏览器</b>里；换设备或别人打开链接，看到的仍是默认演示数据。
            </p>
            {confirmReset ? (
              <div className="flex items-center gap-2">
                <span className="text-[11.5px] text-rose-600">确认清空全部修改？</span>
                <Button tone="danger" onClick={onReset} field="reset-confirm">
                  确认恢复
                </Button>
                <Button tone="quiet" onClick={() => setConfirmReset(false)}>
                  取消
                </Button>
              </div>
            ) : (
              <Button
                tone="danger"
                onClick={() => setConfirmReset(true)}
                disabled={!meta.dirtyKeys.length}
              >
                <RotateCcw size={13} />
                恢复默认演示数据
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* 五个管理入口 */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry) => {
          const Icon = entry.icon
          return (
            <Link key={entry.to} to={entry.to} className="card card-pad card-hover fade-up block">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-blue-50 text-blue-600">
                  <Icon size={16} strokeWidth={2} />
                </span>
                <span className="text-[11px] font-medium text-blue-600">进入 →</span>
              </div>
              <div className="mt-3 text-[13.5px] leading-5 font-semibold text-slate-900">
                {entry.title}
              </div>
              <p className="mt-1.5 text-[11.5px] leading-5 text-slate-500">{entry.desc}</p>
              <div className="tabular mt-3 border-t border-slate-100 pt-2.5 text-[11px] text-slate-400">
                {entry.stat}
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
