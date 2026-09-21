import {
  ArrowRight,
  CheckCircle2,
  Coins,
  Gauge,
  ShieldAlert,
  Target,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardBody, CardHeader, PageHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Badge } from '../components/ui/Badge'
import { StatCard } from '../components/ui/Stat'
import { ProgressBar, ProgressRow } from '../components/ui/Progress'
import { ChartCard, ChartNote } from '../components/charts/ChartCard'
import {
  axisLine,
  axisTick,
  barCursor,
  countTick,
  gridStroke,
  legendProps,
  moneyTick,
  tooltipProps,
} from '../components/charts/theme'
import { RichText } from '../components/ui/RichText'
import { campaign, channels, dailyTotals, insights, phases } from '../data'
import { kpiItems, lowestKpi, weightedAchievement } from '../utils/kpi'
import { openRisks, riskLevelCounts } from '../utils/risk'
import { attentionItems, type AttentionSeverity } from '../utils/attention'
import { fill } from '../utils/text'
import {
  budgetGapPp,
  budgetLeft,
  budgetProgress,
  campaignProgress,
  elapsedDays,
  phaseDaysLeft,
  remainingDays,
  timeProgress,
  totalDays,
} from '../utils/metrics'
import { achieve, countShort, money, moneyShort, mmdd, num, pct, pp } from '../utils/format'
import { attentionSeverityMeta, gapTone, paceTone } from '../utils/labels'

// ============================================================
// Dashboard：只回答三个问题
//   1. 项目现在怎么样？   → 顶部 5 张核心状态卡
//   2. 为什么？           → 每日趋势、核心 KPI、项目阶段
//   3. 哪里需要关注？     → 当前需要关注（由现有数据自动生成，最多 3 条）
//
// ⚠️ 这里不产生任何新数字：
//    预算详细的分配与消耗明细在 Budget 页，KPI 明细在 KPI 页，
//    风险清单在 Risk 页，任务与投流明细在 Project Execution 页。
//    Dashboard 只做「结论」的第一层展示。
// ============================================================

const trend30 = dailyTotals.slice(-30)

/** 完成率最高的一项，用于卡片说明 */
const bestKpi = [...kpiItems].sort(
  (a, b) => b.actual / b.target - a.actual / a.target,
)[0]

/** 当前进行中的阶段（用于阶段卡的说明文案） */
const currentPhase =
  phases.find((phase) => phase.status === 'active') ?? phases[phases.length - 1]

/** 阶段顺序说明：筹备期 → 预热期 → 爆发期 → 收尾期 */
const phaseFlow = phases.map((phase) => phase.name).join(' → ')

/** 关注项卡片的严重程度配色（仅 Dashboard 展示用） */
const severityCardClass: Record<AttentionSeverity, string> = {
  bad: 'border-rose-100 bg-rose-50/50',
  warn: 'border-amber-100 bg-amber-50/50',
  good: 'border-slate-100 bg-slate-50/60',
}
const severityDotClass: Record<AttentionSeverity, string> = {
  bad: 'bg-rose-500',
  warn: 'bg-amber-500',
  good: 'bg-emerald-500',
}

export default function Dashboard() {
  return (
    <>
      <PageHeader
        zh="Dashboard"
        en="总览"
        desc={`${campaign.name}　|　${campaign.startDate} ~ ${campaign.endDate}　|　已执行 ${elapsedDays} / ${totalDays} 天`}
        extra={
          <div className="flex items-center gap-2">
            <Badge tone="info">{campaign.status}</Badge>
            <Badge tone="warn">演示数据 · 全部为虚构</Badge>
          </div>
        }
      />

      {/* ---------------- 1. 项目现在怎么样 ---------------- */}
      {/* 5 张卡只放「一个核心数字 + 一条进度 + 一句话」，不放徽标：
          1440px 下每张卡的标题区只有 130px，徽标会把标签挤到截断。 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={Wallet}
          label="总预算"
          value={moneyShort(campaign.totalBudget)}
          sub={
            <RichText
              text={fill(insights.dashboard.coreCards.budget, {
                count: channels.length,
                days: totalDays,
              })}
            />
          }
        />

        <StatCard
          icon={Coins}
          label="预算使用率"
          value={pct(budgetProgress)}
          sub={
            <>
              <ProgressBar value={budgetProgress * 100} tone={gapTone(budgetGapPp)} height={5} />
              <div className="mt-2">
                <RichText
                  text={fill(
                    budgetGapPp > 0.01
                      ? insights.dashboard.coreCards.budgetRateUp
                      : insights.dashboard.coreCards.budgetRateOk,
                    {
                      gap: pp(budgetGapPp),
                      left: moneyShort(budgetLeft),
                      days: remainingDays,
                    },
                  )}
                />
              </div>
            </>
          }
        />

        <StatCard
          icon={Gauge}
          label="KPI 综合达成率"
          value={pct(weightedAchievement, 2)}
          sub={
            <>
              <ProgressBar
                value={weightedAchievement * 100}
                tone={paceTone(weightedAchievement, timeProgress)}
                height={5}
              />
              <div className="mt-2">
                <RichText
                  text={fill(insights.dashboard.coreCards.kpi, {
                    count: kpiItems.length,
                    bestName: bestKpi.name,
                    best: pct(bestKpi.actual / bestKpi.target),
                  })}
                />
              </div>
            </>
          }
        />

        <StatCard
          icon={Target}
          label="项目进度"
          value={pct(campaignProgress)}
          sub={
            <>
              <ProgressBar value={campaignProgress * 100} tone="info" height={5} />
              <div className="mt-2">
                <RichText
                  text={fill(insights.dashboard.coreCards.progress, {
                    elapsed: elapsedDays,
                    total: totalDays,
                    time: pct(timeProgress),
                  })}
                />
              </div>
            </>
          }
        />

        <StatCard
          icon={ShieldAlert}
          label="风险状态"
          value={`高风险 ${riskLevelCounts.high} 项`}
          sub={
            <>
              <RichText
                text={fill(insights.dashboard.coreCards.risk, {
                  total: riskLevelCounts.high + riskLevelCounts.medium + riskLevelCounts.low,
                  open: openRisks.length,
                  medium: riskLevelCounts.medium,
                  low: riskLevelCounts.low,
                })}
              />
              <Link
                to="/risk"
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                {insights.dashboard.coreCards.riskLink}
                <ArrowRight size={11} />
              </Link>
            </>
          }
        />
      </div>

      {/* ---------------- 2. 为什么（趋势）+ 3. 哪里需要关注 ---------------- */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard
            title="每日花费与曝光趋势"
            subtitle={`近 30 天（${mmdd(trend30[0].date)} ~ ${mmdd(trend30[trend30.length - 1].date)}）`}
          >
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={trend30} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis
                  dataKey="date"
                  tickFormatter={mmdd}
                  tick={axisTick}
                  tickLine={false}
                  axisLine={axisLine}
                  interval={Math.floor(trend30.length / 8)}
                />
                <YAxis
                  yAxisId="left"
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={moneyTick}
                  width={52}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={countTick}
                  width={48}
                />
                <Tooltip
                  {...tooltipProps}
                  cursor={barCursor}
                  formatter={(value: any, name: any) =>
                    name === '每日花费' ? money(Number(value)) : `${num(Number(value))} 次`
                  }
                />
                <Legend {...legendProps} />
                <Bar
                  yAxisId="left"
                  dataKey="spend"
                  name="每日花费"
                  fill="#93b4f6"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={16}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="impressions"
                  name="曝光量"
                  stroke="#7c5cff"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3.5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <ChartNote>
              <RichText text={insights.dashboard.trendNote} />
            </ChartNote>
          </ChartCard>
        </div>

        <Card className="flex flex-col">
          <CardHeader
            title="当前需要关注"
            subtitle={insights.dashboard.attention.desc}
            extra={
              attentionItems.length ? (
                <Badge
                  tone={
                    attentionItems.some((item) => item.severity === 'bad') ? 'bad' : 'warn'
                  }
                >
                  {attentionItems.length} 条
                </Badge>
              ) : null
            }
          />
          <CardBody className="flex-1">
            {attentionItems.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="各项指标都在正常区间"
                hint={insights.dashboard.attention.empty}
                compact
              />
            ) : (
              <div className="space-y-2.5">
                {attentionItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.to}
                    className={`block rounded-xl border px-3.5 py-3 transition-colors hover:border-slate-200 ${severityCardClass[item.severity]}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex min-w-0 items-start gap-1.5">
                        <span
                          className={`mt-[5px] inline-block h-1.5 w-1.5 shrink-0 rounded-full ${severityDotClass[item.severity]}`}
                        />
                        <span className="text-[12.5px] leading-5 font-medium text-slate-800">
                          {item.title}
                        </span>
                      </span>
                      <Badge tone={attentionSeverityMeta[item.severity].tone}>
                        {attentionSeverityMeta[item.severity].label}
                      </Badge>
                    </div>
                    <p className="mt-1.5 pl-3 text-[11.5px] leading-5 text-slate-500">
                      {item.desc}
                    </p>
                    <span className="mt-2 ml-3 inline-flex items-center gap-1 text-[11px] font-medium text-blue-600">
                      {item.toLabel}
                      <ArrowRight size={11} />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* ---------------- 核心 KPI + 项目阶段 ---------------- */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader
            title="核心 KPI 达成"
            subtitle="实际值 ÷ 终期目标值，详细拆解见 KPI 页面"
          />
          <CardBody className="flex-1">
            <div className="divide-y divide-slate-100">
              {[...kpiItems]
                .sort((a, b) => b.weight - a.weight)
                .map((item) => {
                  const ratio = achieve(item.actual, item.target)
                  const isRate = item.unit === '%' || item.unit === '倍'
                  return (
                    <ProgressRow
                      key={item.key}
                      label={item.name}
                      left={
                        isRate
                          ? `${item.actual.toFixed(2)}${item.unit}（${pct(ratio)}）`
                          : `${countShort(item.actual)}（${pct(ratio)}）`
                      }
                      right={
                        isRate
                          ? `目标 ${item.target.toFixed(2)}${item.unit}`
                          : `目标 ${countShort(item.target)}`
                      }
                      value={ratio * 100}
                      tone={paceTone(ratio, timeProgress)}
                    />
                  )
                })}
            </div>
            <p className="mt-3 border-t border-slate-100 pt-3 text-[11.5px] leading-5 text-slate-500">
              <RichText
                text={fill(insights.dashboard.coreKpiNote, {
                  time: pct(timeProgress),
                  lowName: lowestKpi.item.name,
                  low: pct(lowestKpi.rate),
                })}
              />
            </p>
          </CardBody>
        </Card>

        <Card className="flex flex-col">
          <CardHeader
            title="项目阶段进度"
            subtitle={`${phaseFlow}，当前处于${currentPhase.name}`}
            extra={<Badge tone="info">剩余 {remainingDays} 天</Badge>}
          />
          <CardBody className="flex-1">
            <div className="space-y-1">
              {phases.map((phase) => (
                <div key={phase.key} className="rounded-xl px-1 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-slate-800">
                        {phase.name}
                      </span>
                      <Badge
                        tone={
                          phase.status === 'done'
                            ? 'good'
                            : phase.status === 'active'
                              ? 'info'
                              : 'idle'
                        }
                      >
                        {phase.status === 'done'
                          ? '已结束'
                          : phase.status === 'active'
                            ? '进行中'
                            : '未开始'}
                      </Badge>
                    </div>
                    <span className="tabular text-[12px] text-slate-400">
                      {mmdd(phase.startDate)} ~ {mmdd(phase.endDate)}
                      {phase.status === 'active' && phaseDaysLeft(phase) > 0
                        ? `　还剩 ${phaseDaysLeft(phase)} 天`
                        : ''}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <ProgressBar
                      value={phase.progress}
                      tone={
                        phase.status === 'done'
                          ? 'good'
                          : phase.status === 'active'
                            ? 'info'
                            : 'idle'
                      }
                    />
                    <span className="tabular w-10 shrink-0 text-right text-[12px] text-slate-500">
                      {phase.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <p className="mt-6 text-center text-[11px] leading-5 text-slate-400">
        <RichText text={insights.dashboard.footer} />
      </p>
    </>
  )
}
