import { Clock, ShieldAlert } from 'lucide-react'
import {
  CartesianGrid,
  Cell,
  ReferenceArea,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import { Card, CardBody, CardHeader, PageHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Badge } from '../components/ui/Badge'
import { MiniStat } from '../components/ui/Stat'
import { ChartCard } from '../components/charts/ChartCard'
import { axisLine, axisTick, gridStroke, tooltipProps } from '../components/charts/theme'
import type { Tone } from '../components/ui/Badge'
import { insights, riskResponsePlan } from '../data'
import { judgedRisks, openRisks, riskLevelCounts, RISK_HIGH_MIN } from '../utils/risk'
import { fill } from '../utils/text'
import { riskStatusMeta } from '../utils/labels'
import type { RiskLevel, RiskScored } from '../types'

/**
 * 风险页的等级配色（红＝高风险、橙＝中风险、绿＝低风险）。
 * ⚠️ 只在风险页做这层对应，不去改 utils/labels.ts 里的全站共享映射。
 */
const levelTone: Record<RiskLevel, Tone> = { high: 'bad', medium: 'warn', low: 'good' }
const levelColor: Record<RiskLevel, string> = {
  high: '#e5484d',
  medium: '#f5a524',
  low: '#21b573',
}
const levelFull: Record<RiskLevel, string> = {
  high: '重点风险',
  medium: '中等风险',
  low: '一般风险',
}

// ============================================================
// Risk：管理层风险驾驶舱
//
// 只回答三个问题：
//   1. 现在有哪些风险 → 顶部 4 个摘要指标
//   2. 哪些最严重     → 风险优先级概览（概率 × 影响矩阵）
//   3. 接下来做什么   → 重点风险 TOP 5 + 未来 10 天动作
//
// ⚠️ 这里只是「展示层减法」：风险数据、自动判定规则、其他页面都没有改动。
//    完整风险明细仍在 src/data/risk.ts，等级仍由 utils/risk.ts 自动判定；
//    页面只挑出最需要处理的 5 条来展示。
// ============================================================

const levelCount = riskLevelCounts

/** 未关闭的风险，按风险分从高到低（同分按影响、编号排） */
const rankedRisks = [...judgedRisks]
  .filter((risk) => risk.status !== 'resolved')
  .sort((a, b) => b.score - a.score || b.impact - a.impact || a.id.localeCompare(b.id))

/** 重点风险 TOP 5 */
const topRisks = rankedRisks.slice(0, 5)

/** 最需要处理的一条 */
const topRisk = topRisks[0]

/** 待处理（还没进入处理流程）的风险 */
const pendingRisks = judgedRisks.filter((risk) => risk.status === 'open')

/** 已关闭的风险数量 */
const closedCount = judgedRisks.length - openRisks.length

/** 未来 10 天的动作，最多 4 条 */
const nextActions = riskResponsePlan.slice(0, 4)

/** 矩阵上的点：位置＝概率 × 影响，大小随风险分，已关闭的点淡化 */
const scatterData = judgedRisks.map((risk) => ({
  ...risk,
  x: risk.probability,
  y: risk.impact,
  z: 90 + risk.score * 9,
  color: levelColor[risk.level],
  opacity: risk.status === 'resolved' ? 0.3 : 1,
  isTop: risk.id === topRisk?.id,
}))

function RiskTooltip(props: any) {
  const { active, payload } = props
  if (!active || !payload || !payload.length) return null
  const risk = payload[0].payload as RiskScored & { x: number; y: number }
  return (
    <div className="max-w-[260px] rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <span className="tabular text-[11px] text-slate-400">{risk.id}</span>
        <Badge tone={levelTone[risk.level]}>{levelFull[risk.level]}</Badge>
      </div>
      <div className="mt-1.5 text-[12px] leading-5 text-slate-700">{risk.title}</div>
      <div className="mt-1.5 text-[11px] text-slate-400">
        概率 {risk.probability} × 影响 {risk.impact} · {riskStatusMeta[risk.status].label}
      </div>
    </div>
  )
}

export default function Risk() {
  return (
    <>
      <PageHeader
        zh="Risk"
        en="风险分析"
        desc={fill(insights.risk.desc, { total: judgedRisks.length, open: openRisks.length })}
      />

      {/* ---------------- 1. 现在有哪些风险 ---------------- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat
          label="高风险"
          value={`${levelCount.high} 项`}
          hint="需制定应急预案"
          tone="bad"
        />
        <MiniStat
          label="中风险"
          value={`${levelCount.medium} 项`}
          hint="按周跟踪处理进展"
          tone="warn"
        />
        <MiniStat
          label="低风险"
          value={`${levelCount.low} 项`}
          hint="保持监控即可"
          tone="good"
        />
        <MiniStat
          label="待处理风险"
          value={`${pendingRisks.length} 项`}
          hint={pendingRisks.length ? '尚未进入处理' : '已全部进入处理'}
          tone={pendingRisks.length ? 'bad' : 'good'}
        />
      </div>

      {/* ---------------- 2. 哪些风险最严重 ---------------- */}
      <div className="mt-4">
        <ChartCard
          title="风险优先级概览"
          subtitle={`横轴＝发生概率，纵轴＝影响程度，越靠右上越需优先处理；风险分 ≥ ${RISK_HIGH_MIN} 分为重点风险`}
          extra={
            topRisk ? <Badge tone="bad">最需处理 {topRisk.id}</Badge> : null
          }
        >
          <ResponsiveContainer width="100%" height={288}>
            <ScatterChart margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <ReferenceArea
                x1={3.5}
                x2={5.5}
                y1={3.5}
                y2={5.5}
                fill="#e5484d"
                fillOpacity={0.07}
              />
              <XAxis
                type="number"
                dataKey="x"
                name="发生概率"
                domain={[0.5, 5.5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={axisTick}
                tickLine={false}
                axisLine={axisLine}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="影响程度"
                domain={[0.5, 5.5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <ZAxis type="number" dataKey="z" range={[90, 300]} />
              <Tooltip {...tooltipProps} content={<RiskTooltip />} />
              <Scatter data={scatterData}>
                {scatterData.map((item) => (
                  <Cell
                    key={item.id}
                    fill={item.color}
                    fillOpacity={item.opacity}
                    stroke={item.isTop ? '#ffffff' : '#ffffff'}
                    strokeWidth={item.isTop ? 3 : 1.5}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ---------------- 3. 重点风险 TOP 5 ---------------- */}
      <Card className="mt-4">
        <CardHeader
          title="重点风险 TOP 5"
          subtitle="按风险分从高到低排序，只显示最需要处理的 5 条"
          extra={
            <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldAlert size={13} />
              未关闭 {openRisks.length} 项
            </span>
          }
        />
        <CardBody>
          {topRisks.length === 0 ? (
            <EmptyState
              icon={ShieldAlert}
              title="当前没有未关闭的风险"
              hint="所有已登记风险都已关闭，不需要额外处理。"
              compact
            />
          ) : null}

          <div className="space-y-2.5">
            {topRisks.map((risk) => (
              <div
                key={risk.id}
                className="rounded-xl border border-slate-100 px-4 py-3 transition-colors hover:border-slate-200"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2">
                    <span className="tabular mt-[3px] shrink-0 text-[11px] text-slate-400">
                      {risk.id}
                    </span>
                    <span className="text-[13px] leading-5 font-medium text-slate-800">
                      {risk.title}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge tone={levelTone[risk.level]}>{levelFull[risk.level]}</Badge>
                    <Badge tone={riskStatusMeta[risk.status].tone}>
                      {riskStatusMeta[risk.status].label}
                    </Badge>
                  </div>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 pl-8 text-[11.5px] text-slate-500">
                  <span>
                    影响程度 <b className="tabular font-medium text-slate-700">{risk.impact}/5</b>
                  </span>
                  <span className="text-slate-300">·</span>
                  <span>
                    负责人 <b className="font-medium text-slate-700">{risk.owner}</b>
                  </span>
                </div>

                <p className="mt-1.5 line-clamp-2 pl-8 text-[11.5px] leading-5 text-slate-500">
                  <b className="text-slate-700">建议动作：</b>
                  {risk.mitigation}
                </p>
              </div>
            ))}
          </div>

          {closedCount > 0 ? (
            <p className="mt-3.5 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
              已关闭风险 {closedCount} 项，不再列入以上重点清单。
            </p>
          ) : null}
        </CardBody>
      </Card>

      {/* ---------------- 4. 未来 10 天风险动作 ---------------- */}
      <Card className="mt-4">
        <CardHeader
          title="未来 10 天风险动作"
          extra={
            <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Clock size={13} />
              9 月 21 日 ~ 9 月 30 日
            </span>
          }
        />
        <CardBody>
          <div className="divide-y divide-slate-100">
            {nextActions.map((item) => (
              <div key={item.day} className="flex items-start gap-4 py-2.5 first:pt-0 last:pb-0">
                <span className="tabular w-[92px] shrink-0 text-[12px] text-slate-500">
                  {item.day}
                </span>
                <span className="min-w-0 flex-1 text-[12.5px] leading-5 font-medium text-slate-800">
                  {item.title}
                </span>
                {item.riskId ? (
                  <span className="tabular shrink-0 text-[11px] text-slate-400">
                    {item.riskId}
                  </span>
                ) : null}
                <span className="w-[72px] shrink-0 text-right text-[12px] text-slate-600">
                  {item.owner}
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </>
  )
}
