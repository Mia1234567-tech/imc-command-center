import { useState } from 'react'
import { CircleAlert, ListChecks, UserRound, Video } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardBody, CardHeader, PageHeader } from '../components/ui/Card'
import { EmptyTableRow } from '../components/ui/EmptyState'
import { Badge, DotBadge } from '../components/ui/Badge'
import { MiniStat } from '../components/ui/Stat'
import { ProgressBar } from '../components/ui/Progress'
import { ChartCard, ChartNote } from '../components/charts/ChartCard'
import {
  axisLine,
  axisTick,
  barCursor,
  gridStroke,
  tooltipProps,
} from '../components/charts/theme'
import { RichText } from '../components/ui/RichText'
import {
  ads,
  channels,
  insights,
  kols,
  tasks,
  totalEngagements,
  totalImpressions,
} from '../data'
import {
  adCtrCompare,
  adSummary,
  bestChannelRow,
  channelExecution,
  executionSummary,
  kolSummary,
  overallExecution,
  taskCount,
  worstChannelRow,
} from '../utils/execution'
import { weightedAchievement } from '../utils/kpi'
import { fill } from '../utils/text'
import { countShort, money, moneyShort, num, pct, pctValue, wan } from '../utils/format'
import {
  adStatusMeta,
  channelNames,
  kolStatusMeta,
  phaseNames,
  priorityMeta,
  rateTone,
  taskStatusMeta,
} from '../utils/labels'
import type { PhaseKey } from '../types'

const channelColor = (key: string) =>
  channels.find((channel) => channel.key === key)?.color ?? '#94a3b8'

/** 全站平均互动率（互动量 ÷ 曝光量），用于和达人内容的互动率对比 */
const overallEngagementRate = totalEngagements / totalImpressions

/** 投放账户的 CTR（百分比数值，例如 1.84） */
const adCtrValues = adCtrCompare.map((item) => item.ctr)
const adBestCtr = [...adCtrCompare].sort((a, b) => b.ctr - a.ctr)[0]
const adWorstCtr = [...adCtrCompare].sort((a, b) => a.ctr - b.ctr)[0]

/** 有达人合作的渠道名，用于说明达人项目分布（微信视频号为官方账号自运营，没有达人） */
const kolChannels = channels
  .filter((channel) => channel.kolCooperation)
  .map((channel) => channel.shortName)
  .join('、')

const kolStatusCount = kols.reduce(
  (acc, kol) => {
    acc[kol.status] = (acc[kol.status] ?? 0) + 1
    return acc
  },
  {} as Record<string, number>,
)

const kolPie = (['published', 'reviewing', 'scheduled', 'delayed'] as const)
  .map((status) => ({
    status,
    name: kolStatusMeta[status].label,
    value: kolStatusCount[status] ?? 0,
    color:
      status === 'published'
        ? '#21b573'
        : status === 'reviewing'
          ? '#f5a524'
          : status === 'scheduled'
            ? '#3b82f6'
            : '#e5484d',
  }))
  .filter((item) => item.value > 0)


const phaseOrder: PhaseKey[] = ['prep', 'warmup', 'burst', 'closing']

const phaseTone: Record<PhaseKey, 'good' | 'info' | 'idle'> = {
  prep: 'good',
  warmup: 'good',
  burst: 'info',
  closing: 'idle',
}


export default function ProjectExecution() {
  const [phase, setPhase] = useState<PhaseKey | 'all'>('all')
  const visibleTasks = phase === 'all' ? tasks : tasks.filter((t) => t.phase === phase)


  return (
    <>
      <PageHeader
        zh="Project Execution"
        en="项目执行"
        desc="品牌官方账号的内容与投放执行情况：任务推进、达人合作项目与付费投放项目的执行明细。"
        extra={
          <div className="flex items-center gap-2">
            <Badge tone={rateTone(overallExecution)}>
              综合执行度 {pct(overallExecution)}
            </Badge>
            <Badge tone="idle">{taskCount.total} 项任务 · {channelExecution.length} 个渠道</Badge>
          </div>
        }
      />

      {/* 执行总览（精简版） */}
      <Card>
        <CardHeader
          title="执行总览"
          subtitle="四个口径的完成度，权重相同"
          extra={
            <div className="flex items-center gap-2">
              <Badge tone={rateTone(overallExecution)}>
                综合执行度 {pct(overallExecution)}
              </Badge>
              {taskCount.delayed > 0 ? (
                <Badge tone="bad">延期 {taskCount.delayed} 项</Badge>
              ) : null}
            </div>
          }
        />
        <CardBody>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MiniStat
              label="任务进度"
              value={`${executionSummary.taskDone}/${executionSummary.taskTotal}`}
              hint={`平均完成度 ${pct(executionSummary.taskProgress)}`}
              tone="info"
            />
            <MiniStat
              label="达人发布"
              value={`${executionSummary.kolPublished}/${executionSummary.kolTotal}`}
              hint={`签约完成率 ${pct(kolSummary.published / kolSummary.total)}`}
              tone={rateTone(kolSummary.published / kolSummary.total)}
            />
            <MiniStat
              label="内容产出"
              value={`${executionSummary.contentDone}/${executionSummary.contentTarget}`}
              hint={`三渠道合计 ${pct(executionSummary.contentDone / executionSummary.contentTarget)}`}
              tone={rateTone(executionSummary.contentDone / executionSummary.contentTarget)}
            />
            <MiniStat
              label="预算消耗"
              value={moneyShort(executionSummary.spend)}
              hint={`占总预算 ${pct(executionSummary.spend / executionSummary.budget)}`}
              tone="warn"
            />
          </div>

          <div className="mt-4 space-y-2.5">
            {[
              { label: '任务进度', value: executionSummary.taskProgress, color: '#3b82f6' },
              { label: '达人发布', value: kolSummary.published / kolSummary.total, color: '#7c5cff' },
              { label: '内容产出', value: executionSummary.contentDone / executionSummary.contentTarget, color: '#21b573' },
              { label: '预算消耗', value: executionSummary.spend / executionSummary.budget, color: '#e5484d' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-[12px] text-slate-500">{item.label}</span>
                <ProgressBar value={item.value * 100} color={item.color} height={7} />
                <span className="tabular w-11 shrink-0 text-right text-[12px] text-slate-600">
                  {pct(item.value)}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-3.5 rounded-xl border border-amber-200 bg-amber-50/60 px-3.5 py-2.5 text-[11.5px] leading-6 text-amber-800">
              <RichText
                text={fill(insights.execution.overviewNote, {
                  budgetRate: pct(executionSummary.spend / executionSummary.budget),
                  kpiRate: pct(weightedAchievement),
                  contentRate: pct(
                    executionSummary.contentDone / executionSummary.contentTarget,
                  ),
                })}
              />
            </p>
        </CardBody>
      </Card>

      {/* 分渠道执行进度 */}
      <Card className="mt-4">
        <CardHeader
          title="分渠道执行进度"
          subtitle="同一套维度拆到三个平台，看清楚是哪个渠道拖了后腿"
          extra={
            <span className="text-[11px] text-slate-400">
              综合进度 = 任务 30% + 达人 20% + 内容 20% + 预算 30%，无达人合作的渠道按剩余权重归一
            </span>
          }
        />
        <div className="overflow-x-auto">
          <table className="grid-table">
            <thead>
              <tr>
                <th>渠道</th>
                <th className="min-w-[130px]">渠道任务</th>
                <th className="min-w-[130px]">达人发布</th>
                <th className="min-w-[130px]">内容产出</th>
                <th className="min-w-[130px]">预算消耗</th>
                <th className="min-w-[150px]">综合进度</th>
                <th className="num">渠道 CTR</th>
              </tr>
            </thead>
            <tbody>
              {channelExecution.map((row) => {
                const cells = [
                  {
                    text: `${row.taskDone}/${row.taskTotal}`,
                    value: row.taskProgress,
                  },
                  row.kolCooperation
                    ? {
                        text: `${row.kolPublished}/${row.kolTotal}`,
                        value: row.kolProgress,
                      }
                    : { text: '无达人合作', value: null },
                  {
                    text: `${row.contentDone}/${row.contentTarget}`,
                    value: row.contentProgress,
                  },
                  {
                    text: moneyShort(row.spend),
                    value: row.budgetProgress,
                  },
                ]
                return (
                  <tr key={row.channel}>
                    <td>
                      <DotBadge color={row.color}>{row.name}</DotBadge>
                    </td>
                    {cells.map((cell, index) => (
                      <td key={index}>
                        {cell.value === null ? (
                          <span className="text-[11px] text-slate-400">{cell.text}</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <ProgressBar
                              value={cell.value * 100}
                              color={row.color}
                              height={6}
                            />
                            <span className="tabular w-14 shrink-0 text-right text-[11px] text-slate-500">
                              {cell.text}
                            </span>
                          </div>
                        )}
                      </td>
                    ))}
                    <td>
                      <div className="flex items-center gap-2">
                        <ProgressBar
                          value={row.overall * 100}
                          tone={rateTone(row.overall)}
                          height={8}
                        />
                        <span className="tabular w-11 shrink-0 text-right text-[12px] font-medium text-slate-800">
                          {pct(row.overall)}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`tabular num font-medium ${
                        row.ctr >= 0.018
                          ? 'text-emerald-600'
                          : row.ctr >= 0.015
                            ? 'text-amber-600'
                            : 'text-rose-600'
                      }`}
                    >
                      {pct(row.ctr, 2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-5 py-3">
          <p className="text-[11.5px] leading-6 text-slate-500">
            <RichText
              text={fill(insights.execution.channelConclusion, {
                bestName: bestChannelRow.name,
                bestRate: pct(bestChannelRow.overall),
                bestTone:
                  bestChannelRow.contentProgress > bestChannelRow.budgetProgress
                    ? insights.execution.channelToneHealthy
                    : insights.execution.channelToneRisky,
                worstName: worstChannelRow.name,
                worstRate: pct(worstChannelRow.overall),
                worstTask: pct(worstChannelRow.taskProgress),
                worstKolPart: worstChannelRow.kolCooperation
                  ? `、达人发布 ${worstChannelRow.kolPublished}/${worstChannelRow.kolTotal}`
                  : insights.execution.channelNoKol,
                worstBudget: pct(worstChannelRow.budgetProgress),
              })}
            />
          </p>
        </div>
      </Card>

      {/* 任务表 */}
      <Card className="mt-4">
        <CardHeader
          title="任务进度"
          subtitle={`共 ${visibleTasks.length} 项任务`}
          extra={
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPhase('all')}
                className={`rounded-lg px-2.5 py-1 text-[12px] font-medium transition-all duration-150 active:scale-[0.97] ${
                  phase === 'all'
                    ? 'bg-blue-600 text-white shadow-[0_2px_8px_-3px_rgba(37,99,235,0.7)]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                全部
              </button>
              {phaseOrder.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPhase(key)}
                  className={`rounded-lg px-2.5 py-1 text-[12px] font-medium transition-all duration-150 active:scale-[0.97] ${
                    phase === key
                      ? 'bg-blue-600 text-white shadow-[0_2px_8px_-3px_rgba(37,99,235,0.7)]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {phaseNames[key]}
                </button>
              ))}
            </div>
          }
        />
        <div className="overflow-x-auto">
          <table className="grid-table">
            <thead>
              <tr>
                <th>任务</th>
                <th>阶段</th>
                <th>渠道</th>
                <th>负责人</th>
                <th>计划周期</th>
                <th className="min-w-[150px]">完成度</th>
                <th>状态</th>
                <th>优先级</th>
              </tr>
            </thead>
            <tbody>
              {visibleTasks.length === 0 ? (
                <EmptyTableRow
                  colSpan={8}
                  icon={ListChecks}
                  title="该阶段暂无任务"
                  hint="切换上方的阶段筛选，或回到「全部」查看完整任务清单。"
                />
              ) : null}
              {visibleTasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="tabular text-[11px] text-slate-400">{task.id}</span>
                      <span className="font-medium text-slate-800">{task.name}</span>
                    </div>
                  </td>
                  <td>
                    <Badge tone={phaseTone[task.phase]}>{phaseNames[task.phase]}</Badge>
                  </td>
                  <td>
                    {task.channel === 'cross' ? (
                      <span className="text-slate-400">跨渠道</span>
                    ) : (
                      <DotBadge color={channelColor(task.channel)}>
                        {channelNames[task.channel]}
                      </DotBadge>
                    )}
                  </td>
                  <td className="text-slate-600">{task.owner}</td>
                  <td className="tabular text-[12px] text-slate-500">
                    {task.startDate.slice(5)} ~ {task.endDate.slice(5)}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <ProgressBar
                        value={task.progress}
                        tone={taskStatusMeta[task.status].tone}
                        height={6}
                      />
                      <span className="tabular w-9 shrink-0 text-right text-[11px] text-slate-500">
                        {task.progress}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <Badge tone={taskStatusMeta[task.status].tone}>
                      {taskStatusMeta[task.status].label}
                    </Badge>
                  </td>
                  <td>
                    <Badge tone={priorityMeta[task.priority].tone}>
                      {priorityMeta[task.priority].label}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-5 py-3">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ListChecks size={13} />
              <RichText text={insights.execution.delayedNote} />
            </span>
        </div>
      </Card>

      {/* 达人项目 */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-4">
        <ChartCard
          title="达人合作状态"
          subtitle={`共签约 ${kols.length} 位达人 · 仅在 ${kolChannels} 合作`}
        >
          <ResponsiveContainer width="100%" height={168}>
            <PieChart>
              <Pie
                data={kolPie}
                dataKey="value"
                nameKey="name"
                innerRadius={44}
                outerRadius={68}
                paddingAngle={2}
                stroke="#ffffff"
                strokeWidth={2}
              >
                {kolPie.map((item) => (
                  <Cell key={item.status} fill={item.color} />
                ))}
              </Pie>
              <Tooltip {...tooltipProps} formatter={(value: any) => `${value} 位`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-1 space-y-1.5">
            {kolPie.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between text-[12px]"
              >
                <DotBadge color={item.color}>{item.name}</DotBadge>
                <span className="tabular text-slate-600">{item.value} 位</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <Card className="flex flex-col xl:col-span-3">
          <CardHeader
            title="达人项目明细"
            subtitle="粉丝量取自各平台公开数据口径（演示用）"
            extra={
              <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <UserRound size={13} />
                已发布 {kolSummary.published} 位
              </span>
            }
          />
          <div className="overflow-x-auto">
            <table className="grid-table">
              <thead>
                <tr>
                  <th>达人</th>
                  <th>渠道</th>
                  <th>层级</th>
                  <th>粉丝量</th>
                  <th>报价</th>
                  <th>发布时间</th>
                  <th>状态</th>
                  <th>曝光量</th>
                  <th>互动量</th>
                  <th>互动率</th>
                </tr>
              </thead>
              <tbody>
                {kols.length === 0 ? (
                  <EmptyTableRow
                    colSpan={10}
                    icon={UserRound}
                    title="暂无达人合作项目"
                    hint="当前 Campaign 还没有登记达人排期与效果数据。"
                  />
                ) : null}
                {kols.map((kol) => {
                  const rate =
                    kol.impressions && kol.engagements
                      ? (kol.engagements / kol.impressions) * 100
                      : null
                  return (
                    <tr key={kol.id}>
                      <td className="font-medium text-slate-800">{kol.name}</td>
                      <td>
                        <DotBadge color={channelColor(kol.channel)}>
                          {channelNames[kol.channel]}
                        </DotBadge>
                      </td>
                      <td className="text-slate-600">{kol.tier}</td>
                      <td className="tabular text-slate-600">{wan(kol.followers)}</td>
                      <td className="tabular text-slate-600">{money(kol.quote)}</td>
                      <td className="tabular text-[12px] text-slate-500">
                        {kol.publishDate.slice(5)}
                      </td>
                      <td>
                        <Badge tone={kolStatusMeta[kol.status].tone}>
                          {kolStatusMeta[kol.status].label}
                        </Badge>
                      </td>
                      <td className="tabular text-slate-600">
                        {kol.impressions ? countShort(kol.impressions) : '—'}
                      </td>
                      <td className="tabular text-slate-600">
                        {kol.engagements ? countShort(kol.engagements) : '—'}
                      </td>
                      <td className="tabular text-slate-600">
                        {rate ? pctValue(rate, 1) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-5 py-3 text-[11px] leading-5 text-slate-400">
              <RichText
                text={fill(insights.execution.kolSummaryNote, {
                  spend: money(kolSummary.spend),
                  impressions: num(kolSummary.impressions),
                  engagements: num(kolSummary.engagements),
                  rate: pctValue(kolSummary.engagementRate, 2),
                  overallRate: pctValue(overallEngagementRate * 100, 2),
                  impShare: pct(kolSummary.impressionShare),
                })}
              />
            </div>
        </Card>
      </div>

      {/* 投流项目 */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="flex flex-col xl:col-span-3">
          <CardHeader
            title="投流项目明细"
            subtitle={`${ads.length} 个投放账户的累计消耗与效率`}
            extra={
              <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Video size={13} />
                累计花费 {moneyShort(adSummary.spend)}
              </span>
            }
          />
          <div className="overflow-x-auto">
            <table className="grid-table">
              <thead>
                <tr>
                  <th>投放账户</th>
                  <th>日预算</th>
                  <th>累计花费</th>
                  <th>曝光量</th>
                  <th>点击量</th>
                  <th>CTR</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {ads.length === 0 ? (
                  <EmptyTableRow
                    colSpan={7}
                    icon={Video}
                    title="暂无投流账户"
                    hint="投放账户建立后，这里会显示每个账户的花费、曝光与 CTR。"
                  />
                ) : null}
                {ads.map((ad) => {
                  const ctr = (ad.clicks / ad.impressions) * 100
                  return (
                    <tr key={ad.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: channelColor(ad.channel) }}
                          />
                          <span className="font-medium text-slate-800">
                            {ad.account.split('· ')[1] ?? ad.account}
                          </span>
                        </div>
                      </td>
                      <td className="tabular text-slate-500">{moneyShort(ad.dailyBudget)}</td>
                      <td className="tabular text-slate-700">{moneyShort(ad.spend)}</td>
                      <td className="tabular text-slate-600">{countShort(ad.impressions)}</td>
                      <td className="tabular text-slate-600">{countShort(ad.clicks)}</td>
                      <td
                        className={`tabular font-medium ${
                          ctr >= 2
                            ? 'text-emerald-600'
                            : ctr >= 1.5
                              ? 'text-amber-600'
                              : 'text-rose-600'
                        }`}
                      >
                        {pctValue(ctr, 2)}
                      </td>
                      <td>
                        <Badge tone={adStatusMeta[ad.status].tone}>
                          {adStatusMeta[ad.status].label}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="xl:col-span-2">
          <ChartCard
            title="各投放账户 CTR"
            subtitle="CTR = 点击量 ÷ 曝光量，行业参考区间 1.5% ~ 2%"
            extra={
              <Badge tone={adSummary.ctr >= 1.5 ? 'good' : 'warn'}>
                整体 {pctValue(adSummary.ctr, 2)}
              </Badge>
            }
          >
            <ResponsiveContainer width="100%" height={286}>
              <BarChart
                data={adCtrCompare}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridStroke} />
                <XAxis
                  type="number"
                  tick={axisTick}
                  tickLine={false}
                  axisLine={axisLine}
                  domain={[0, Math.ceil(Math.max(...adCtrValues) * 1.3 * 10) / 10]}
                  tickFormatter={(value: number) => `${value}%`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ ...axisTick, fontSize: 10.5 }}
                  tickLine={false}
                  axisLine={false}
                  width={92}
                />
                <Tooltip
                  {...tooltipProps}
                  cursor={barCursor}
                  formatter={(value: any) => pctValue(Number(value), 2)}
                />
                <ReferenceLine
                  x={1.5}
                  stroke="#f5a524"
                  strokeDasharray="4 3"
                  label={{ value: '行业参考 1.5%', position: 'top', fill: '#b45309', fontSize: 10 }}
                />
                <Bar dataKey="ctr" name="CTR" radius={[0, 4, 4, 0]} maxBarSize={16}>
                  {adCtrCompare.map((item, index) => (
                    <Cell key={index} fill={item.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <ChartNote>
              <RichText
                text={fill(insights.execution.adNote, {
                  count: ads.length,
                  minCtr: pctValue(Math.min(...adCtrValues), 2),
                  maxCtr: pctValue(Math.max(...adCtrValues), 2),
                  bestName: adBestCtr.name,
                  bestCtr: pctValue(adBestCtr.ctr, 2),
                  worstName: adWorstCtr.name,
                  worstCtr: pctValue(adWorstCtr.ctr, 2),
                  avgCtr: pctValue(adSummary.ctr, 2),
                })}
              />
            </ChartNote>
          </ChartCard>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3">
        <CircleAlert size={15} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-[12px] leading-6 text-amber-800">
          <RichText
            text={fill(insights.execution.keyIssues, {
              budgetRate: pct(executionSummary.spend / executionSummary.budget),
              kpiRate: pct(weightedAchievement),
            })}
          />
        </p>
      </div>
    </>
  )
}
