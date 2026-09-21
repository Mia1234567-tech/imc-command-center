import { Gauge, Target, TriangleAlert, TrendingUp } from 'lucide-react'
import {
  Area,
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
import { Badge, DotBadge } from '../components/ui/Badge'
import { StatCard } from '../components/ui/Stat'
import { ProgressBar } from '../components/ui/Progress'
import { ChartCard, ChartNote } from '../components/charts/ChartCard'
import {
  axisLine,
  axisTick,
  countTick,
  gridStroke,
  legendProps,
  lineCursor,
  tooltipProps,
} from '../components/charts/theme'
import { RichText } from '../components/ui/RichText'
import { campaign, dailyTotals, insights, kpiLevelGuide } from '../data'
import {
  channelKpiRows,
  kpiDataRange,
  kpiGapRows,
  kpiItems,
  lowestKpi,
  weightedAchievement,
} from '../utils/kpi'
import { fill } from '../utils/text'
import { elapsedDays, remainingDays, timeProgress, totalDays } from '../utils/metrics'
import { achieve, countShort, num, pct } from '../utils/format'
import { paceTone } from '../utils/labels'

// ============================================================
// KPI 页
//
// 5 项核心指标的完成情况 + 差距测算。
// 页面上的每个数字都来自 utils/kpi.ts：
// 曝光与点击互动由每日趋势累加，A3 / TI / 平台搜索取平台后台登记的累计值。
// ============================================================

const toneColor: Record<string, string> = {
  good: '#21b573',
  warn: '#f5a524',
  bad: '#e5484d',
  info: '#3b82f6',
  idle: '#94a3b8',
}

const trendData = dailyTotals.slice(-30).map((row) => ({
  date: row.date,
  impressions: row.impressions,
  clicksEngagements: row.clicks + row.engagements,
}))

/** 曝光那一行（差距最大的主指标），用于结论文案 */
const exposureRow = kpiGapRows.find((row) => row.item.key === 'impressions')!
/** 完成率最高的一项 */
const bestRow = [...kpiGapRows].sort((a, b) => b.rate - a.rate)[0]

const channelRow = (key: string) => channelKpiRows.find((row) => row.channel.key === key)!
const douyinRow = channelRow('douyin')
const xiaohongshuRow = channelRow('xiaohongshu')
const shipinhaoRow = channelRow('shipinhao')

/** 按当前日均还需要提速的指标名，用于结论文案 */
const slowNames =
  kpiGapRows
    .filter((row) => row.times > 1)
    .map((row) => row.item.name)
    .join('、') || '无'

/** 达成率健康度对应的文字颜色 */
const toneText: Record<string, string> = {
  good: 'text-emerald-600',
  warn: 'text-amber-600',
  bad: 'text-rose-600',
  info: 'text-blue-600',
  idle: 'text-slate-500',
}

/** 完成率统一保留一位小数；极小值显示成「<0.01%」，避免满屏的 0.00% */
function rateText(value: number): string {
  if (value > 0 && value < 0.0001) return '<0.01%'
  return pct(value, 1)
}

export default function Kpi() {
  return (
    <>
      <PageHeader
        zh="KPI"
        en="KPI 达成"
        desc={fill(insights.kpi.desc, {
          time: pct(timeProgress),
          budget: pct(campaign.totalSpent / campaign.totalBudget),
          rate: rateText(weightedAchievement),
        })}
        extra={
          <div className="flex items-center gap-2">
            <Badge tone={paceTone(weightedAchievement, timeProgress)}>
              加权综合 {rateText(weightedAchievement)}
            </Badge>
            <Badge tone="info">时间进度 {pct(timeProgress)}</Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Gauge}
          label="加权综合达成率"
          value={rateText(weightedAchievement)}
          badge={{
            text: `${kpiItems.length} 项加权`,
            tone: paceTone(weightedAchievement, timeProgress),
          }}
          sub={<>已执行 {elapsedDays} 天，剩余 {remainingDays} 天</>}
        />
        <StatCard
          icon={Target}
          label="已达标指标"
          value={`0 / ${kpiItems.length} 项`}
          badge={{ text: '达标线 95%', tone: 'idle' }}
          sub={
            <>
              执行中段按时间进度 {pct(timeProgress)} 对照，完成率区间{' '}
              {rateText(lowestKpi.rate)} ~ {rateText(bestRow.rate)}
            </>
          }
        />
        <StatCard
          icon={TriangleAlert}
          label="最低完成指标"
          value={`${lowestKpi.item.name} ${rateText(lowestKpi.rate)}`}
          badge={{ text: '重点补强', tone: 'warn' }}
          sub={
            <>
              本期累计 {num(lowestKpi.item.actual)}，终期目标 {num(lowestKpi.item.target)}
            </>
          }
        />
        <StatCard
          icon={TrendingUp}
          label="曝光缺口"
          value={countShort(exposureRow.left)}
          badge={{ text: `剩余 ${remainingDays} 天`, tone: 'warn' }}
          sub={<>剩余天数内需做到日均 {countShort(Math.round(exposureRow.neededDaily))} 次</>}
        />
      </div>

      {/* 5 张指标卡 */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpiItems.map((item) => {
          const rate = achieve(item.actual, item.target)
          const tone = paceTone(rate, timeProgress)
          return (
            <StatCard
              key={item.key}
              label={item.name}
              value={countShort(item.actual)}
              badge={{ text: rateText(rate), tone }}
              sub={
                <>
                  终期目标 {countShort(item.target)} {item.unit}
                </>
              }
              spark={item.trend}
              sparkColor={toneColor[tone]}
            />
          )
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        {/* 差距测算 */}
        <Card className="flex flex-col xl:col-span-3">
          <CardHeader
            title="差距测算"
            subtitle="距离终期目标还差多少，剩余天数内需要做到什么水平"
            extra={<Badge tone="warn">补弱项 + 提效率</Badge>}
          />
          <div className="overflow-x-auto">
            <table className="grid-table">
              <thead>
                <tr>
                  <th>核心指标</th>
                  <th className="num">本期累计</th>
                  <th className="num">终期目标</th>
                  <th className="min-w-[124px]">完成率</th>
                  <th className="num">剩余差距</th>
                  <th className="num">剩余日均需求</th>
                  <th className="num">当前日均</th>
                </tr>
              </thead>
              <tbody>
                {kpiGapRows.map((row) => (
                  <tr key={row.item.key}>
                    <td className="font-medium text-slate-800">{row.item.name}</td>
                    <td className="tabular num text-slate-800">{countShort(row.item.actual)}</td>
                    <td className="tabular num text-slate-500">{countShort(row.item.target)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <ProgressBar
                          value={row.rate * 100}
                          tone={paceTone(row.rate, timeProgress)}
                          height={6}
                        />
                        <span
                          className={`tabular w-14 shrink-0 text-right text-[11px] ${
                            toneText[paceTone(row.rate, timeProgress)]
                          }`}
                        >
                          {rateText(row.rate)}
                        </span>
                      </div>
                    </td>
                    <td className="tabular num text-slate-600">{countShort(row.left)}</td>
                    <td className="tabular num font-medium text-amber-600">
                      {countShort(Math.round(row.neededDaily))}
                    </td>
                    <td className="tabular num text-slate-500">
                      {countShort(Math.round(row.currentDaily))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-5 py-3">
            <p className="text-[11.5px] leading-6 text-slate-500">
              <RichText
                text={
                  exposureRow.times >= 1
                    ? fill(insights.kpi.gapNoteUp, {
                        days: remainingDays,
                        elapsed: elapsedDays,
                        current: num(Math.round(exposureRow.currentDaily)),
                        needed: num(Math.round(exposureRow.neededDaily)),
                        times: exposureRow.times.toFixed(1),
                      })
                    : fill(insights.kpi.gapNoteOk, {
                        days: remainingDays,
                        elapsed: elapsedDays,
                        current: num(Math.round(exposureRow.currentDaily)),
                        needed: num(Math.round(exposureRow.neededDaily)),
                        slowNames,
                      })
                }
              />
            </p>
          </div>
        </Card>

        {/* 趋势 */}
        <div className="xl:col-span-2">
          <ChartCard
            title="曝光与点击互动趋势"
            subtitle="近 30 天，看放量动作有没有真正带来量级提升"
          >
            <ResponsiveContainer width="100%" height={286}>
              <ComposedChart data={trendData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v: string) => v.slice(5).replace('-', '/')}
                  tick={axisTick}
                  tickLine={false}
                  axisLine={axisLine}
                  interval={Math.floor(trendData.length / 6)}
                />
                <YAxis
                  yAxisId="left"
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={countTick}
                  width={48}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={countTick}
                  width={44}
                />
                <Tooltip
                  {...tooltipProps}
                  cursor={lineCursor}
                  formatter={(value: any) => `${num(Number(value))} 次`}
                />
                <Legend {...legendProps} />
                <defs>
                  <linearGradient id="kpiImpressionFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="impressions"
                  name="曝光量"
                  stroke="#3b82f6"
                  strokeWidth={1.8}
                  fill="url(#kpiImpressionFill)"
                  fillOpacity={1}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="clicksEngagements"
                  name="点击互动"
                  stroke="#ff8a3d"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3.5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <ChartNote>
              <RichText text={insights.kpi.trendNote} />
            </ChartNote>
          </ChartCard>
        </div>
      </div>

      {/* 分渠道 */}
      <Card className="mt-4">
        <CardHeader
          title="分渠道曝光与互动"
          subtitle="同一套指标拆到三个平台，看量级与质量分别卡在哪里"
          extra={
            <span className="text-[11px] text-slate-400">
              全站曝光 {num(dailyTotals.reduce((a, d) => a + d.impressions, 0))} 次
            </span>
          }
        />
        <div className="overflow-x-auto">
          <table className="grid-table">
            <thead>
              <tr>
                <th>渠道</th>
                <th className="num">曝光量</th>
                <th className="min-w-[160px]">曝光达成</th>
                <th className="num">点击量</th>
                <th className="num">互动量</th>
                <th className="num">CTR</th>
                <th className="num">互动率</th>
              </tr>
            </thead>
            <tbody>
              {channelKpiRows.map((row) => (
                <tr key={row.channel.key}>
                  <td>
                    <DotBadge color={row.channel.color}>{row.channel.name}</DotBadge>
                  </td>
                  <td className="tabular num text-slate-800">{num(row.channel.impressions)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <ProgressBar
                        value={row.impressionRate * 100}
                        tone={paceTone(row.impressionRate, timeProgress)}
                        height={6}
                      />
                      <span
                        className={`tabular w-14 shrink-0 text-right text-[11px] ${
                          toneText[paceTone(row.impressionRate, timeProgress)]
                        }`}
                      >
                        {rateText(row.impressionRate)}
                      </span>
                    </div>
                  </td>
                  <td className="tabular num text-slate-600">{num(row.channel.clicks)}</td>
                  <td className="tabular num text-slate-600">{num(row.channel.engagements)}</td>
                  <td className="tabular num text-slate-600">{pct(row.ctr, 2)}</td>
                  <td className="tabular num text-slate-600">{pct(row.engagementRate, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-5 py-3">
          <p className="text-[11.5px] leading-6 text-slate-500">
            <RichText
              text={fill(insights.kpi.channelNote, {
                douyin: rateText(douyinRow.impressionRate),
                xiaohongshu: rateText(xiaohongshuRow.impressionRate),
                shipinhao: rateText(shipinhaoRow.impressionRate),
                shipinhaoRate: pct(shipinhaoRow.engagementRate, 2),
              })}
            />
          </p>
        </div>
      </Card>

      {/* 口径与解读 */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader title="指标口径说明" subtitle="每个指标怎么算、谁负责" />
          <CardBody>
            <div className="divide-y divide-slate-100">
              {kpiItems.map((item) => (
                <div key={item.key} className="flex items-start justify-between gap-4 py-2.5">
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-medium text-slate-800">
                      {item.name}
                    </div>
                    <p className="mt-0.5 text-[11.5px] leading-5 text-slate-500">{item.note}</p>
                  </div>
                  <span className="shrink-0 text-[11px] whitespace-nowrap text-slate-400">
                    权重 {Math.round(item.weight * 100)}%　|　{item.owner}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="flex flex-col">
          <CardHeader title="达成率解读" subtitle="怎么看这些百分比" />
          <CardBody className="flex-1">
            <div className="space-y-3">
              {kpiLevelGuide.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-100 px-3.5 py-3"
                >
                  <Badge tone={item.tone}>{item.title}</Badge>
                  <p className="mt-2 text-[11.5px] leading-5 text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3 text-[11.5px] leading-6 text-slate-500">
              <RichText
                text={`${fill(insights.kpi.caption, {
                  start: kpiDataRange.start,
                  end: kpiDataRange.end,
                  days: kpiDataRange.days,
                  totalDays,
                })}${fill(insights.kpi.summaryNote, {
                  count: kpiItems.length,
                  rate: rateText(weightedAchievement),
                  timeProgress: pct(timeProgress),
                  budgetProgress: pct(campaign.totalSpent / campaign.totalBudget),
                })}`}
              />
            </p>
          </CardBody>
        </Card>
      </div>
    </>
  )
}
