import { Coins, Percent, PiggyBank, Wallet } from 'lucide-react'
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ReferenceLine,
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
  barCursor,
  gridStroke,
  legendProps,
  lineCursor,
  moneyTick,
  tooltipProps,
} from '../components/charts/theme'
import { RichText } from '../components/ui/RichText'
import {
  budgetActions,
  budgetAlerts,
  budgetDimensions,
  budgetReconciliation,
  channels,
  dailyTotals,
  insights,
} from '../data'
import { weightedAchievement } from '../utils/kpi'
import { fill } from '../utils/text'
import {
  budgetGapPp,
  budgetLeft,
  dailyBurn,
  elapsedDays,
  remainingDays,
  safeDailyBurn,
  timeProgress,
  totalDays,
} from '../utils/metrics'
import {
  achieve,
  money,
  moneyShort,
  mmdd,
  pct,
  signedMoney,
  signedPct,
} from '../utils/format'
import { gapTone } from '../utils/labels'

// ============================================================
// 预算页
//
// 这里只做两件事：
// 1. 把 10 个预算维度的两个原始数字（预算额 / 已使用额）加总；
// 2. 从加总结果推出总预算、已使用、剩余、使用率、各维度占比。
//
// 页面上没有任何写死的金额结果，改 src/data/budget.ts 里的数字，
// 表格、卡片、图表、结论文案会全部跟着变。
// ============================================================

/** 10 个维度各自的配色（只用于图表与左侧色点） */
const dimensionPalette = [
  '#3b82f6',
  '#7c5cff',
  '#e5484d',
  '#21b573',
  '#f5a524',
  '#0ea5e9',
  '#8b5cf6',
  '#14b8a6',
  '#f97316',
  '#94a3b8',
]

/** 维度明细：剩余、使用率、占比都由 budget 与 spent 算出来 */
const rows = budgetDimensions.map((item, index) => ({
  ...item,
  color: dimensionPalette[index % dimensionPalette.length],
  left: item.budget - item.spent,
  rate: achieve(item.spent, item.budget),
  over: item.spent > item.budget,
}))

const totalBudget = rows.reduce((sum, row) => sum + row.budget, 0)
const totalSpent = rows.reduce((sum, row) => sum + row.spent, 0)
const totalLeft = totalBudget - totalSpent
const totalUsage = achieve(totalSpent, totalBudget)

/** 加上预算占比（占比的分母就是总预算） */
const detailRows = rows.map((row) => ({
  ...row,
  share: achieve(row.budget, totalBudget),
}))

/** 按预算额从大到小排序，用于「前五个维度占比」这类结论 */
const byBudget = [...detailRows].sort((a, b) => b.budget - a.budget)
const topFiveShare = byBudget.slice(0, 5).reduce((sum, row) => sum + row.share, 0)

/** 按使用率从低到高排序，用于找「沉淀最多」的维度 */
const byUsage = [...detailRows].sort((a, b) => a.rate - b.rate)
const overRow = detailRows.find((row) => row.over)
const unusedRow = byUsage.find((row) => row.spent === 0)
const lowRow = byUsage.find((row) => row.spent > 0 && row.rate > 0) ?? byUsage[0]

/** 按当前日均花费推算的终期超支 */
const expectedOver = Math.max(dailyBurn * remainingDays - budgetLeft, 0)

/** 预警清单与建议动作里用到的数字，全部来自上面的计算结果 */
const alertVars = {
  gap: (budgetGapPp * 100).toFixed(1),
  over: moneyShort(expectedOver),
  overName: overRow?.name ?? '—',
  overAmount: overRow ? money(overRow.spent - overRow.budget) : '¥0',
  lowName: lowRow?.name ?? '—',
  lowRate: pct(lowRow?.rate ?? 0),
  unusedName: unusedRow?.name ?? '—',
  unused: unusedRow ? money(unusedRow.budget - unusedRow.spent) : '¥0',
  safe: money(Math.round(safeDailyBurn)),
  budgetRate: pct(totalUsage),
  kpiRate: pct(weightedAchievement),
}

/** 累计消耗曲线：实际 vs 按时间均匀的计划 */
let running = 0
const cumulativeData = dailyTotals.map((row, index) => {
  running += row.spend
  return {
    date: row.date,
    actual: running,
    plan: Math.round((totalBudget * (index + 1)) / totalDays),
    daily: row.spend,
  }
})

/** 各维度预算 vs 已使用（横向对比条形图的数据） */
const compareData = detailRows.map((row) => ({
  // 用完整维度名：原来缩写成的「D-01」在视觉上也容易被读成「被截断」
  name: row.name,
  budget: row.budget,
  spent: row.spent,
  color: row.color,
}))

/** 分渠道预算执行 */
const channelRows = channels.map((channel) => ({
  channel,
  ratio: achieve(channel.spent, channel.budget),
  left: channel.budget - channel.spent,
}))

export default function Budget() {
  return (
    <>
      <PageHeader
        zh="Budget"
        en="预算管理"
        desc={fill(insights.budget.desc, {
          rate: pct(totalUsage),
          time: pct(timeProgress),
          gap: `${(budgetGapPp * 100).toFixed(1)} 个百分点`,
        })}
        extra={
          <div className="flex items-center gap-2">
            <Badge tone={gapTone(budgetGapPp)}>
              使用率超前 {signedPct(budgetGapPp)}
            </Badge>
            <Badge tone="idle">{detailRows.length} 个预算维度</Badge>
          </div>
        }
      />

      {/* 四个总览数字：总预算 / 已使用 / 剩余 / 使用率 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Campaign 总预算"
          value={moneyShort(totalBudget)}
          sub={<>{detailRows.length} 个预算维度合计（业务口径待确认）</>}
        />
        <StatCard
          icon={Coins}
          label="已使用预算"
          value={moneyShort(totalSpent)}
          badge={{ text: pct(totalUsage), tone: gapTone(budgetGapPp) }}
          sub={
            <>
              已执行 {elapsedDays} 天，日均花费 {money(Math.round(dailyBurn))}
            </>
          }
          spark={dailyTotals.slice(-14).map((d) => d.spend)}
          sparkColor="#3b82f6"
        />
        <StatCard
          icon={PiggyBank}
          label="剩余预算"
          value={moneyShort(totalLeft)}
          badge={{ text: `剩余 ${remainingDays} 天`, tone: 'info' }}
          sub={<>剩余天数内每日最多可花 {money(Math.round(safeDailyBurn))}</>}
        />
        <StatCard
          icon={Percent}
          label="预算使用率"
          value={pct(totalUsage)}
          badge={{ text: `时间进度 ${pct(timeProgress)}`, tone: 'idle' }}
          sub={<>比时间进度快 {signedPct(budgetGapPp)}</>}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard
            title="累计消耗 vs 计划曲线"
            subtitle={`已执行 ${elapsedDays} / ${totalDays} 天`}
            extra={<Badge tone="bad">超前 {signedPct(budgetGapPp)}</Badge>}
          >
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={cumulativeData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis
                  dataKey="date"
                  tickFormatter={mmdd}
                  tick={axisTick}
                  tickLine={false}
                  axisLine={axisLine}
                  interval={Math.floor(cumulativeData.length / 7)}
                />
                <YAxis
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={moneyTick}
                  width={56}
                />
                <Tooltip
                  {...tooltipProps}
                  cursor={lineCursor}
                  formatter={(value: any) => money(Number(value))}
                />
                <Legend {...legendProps} />
                <defs>
                  <linearGradient id="budgetActualFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="actual"
                  name="实际累计消耗"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#budgetActualFill)"
                  fillOpacity={1}
                />
                <Line
                  type="linear"
                  dataKey="plan"
                  name="计划累计（按时间均匀）"
                  stroke="#f5a524"
                  strokeWidth={1.8}
                  strokeDasharray="5 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="daily"
                  name="每日花费"
                  stroke="#cbd5e1"
                  strokeWidth={1.4}
                  dot={false}
                  legendType="none"
                />
                <ReferenceLine
                  y={totalBudget}
                  stroke="#e5484d"
                  strokeDasharray="4 3"
                  label={{
                    value: `预算上限 ${moneyShort(totalBudget)}`,
                    position: 'insideTopRight',
                    fill: '#b91c1c',
                    fontSize: 11,
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <ChartNote>
              <RichText
                text={fill(insights.budget.cumulativeNote, { gap: signedPct(budgetGapPp) })}
              />
            </ChartNote>
          </ChartCard>
        </div>

        <Card className="flex flex-col">
          <CardHeader title="预算执行诊断" subtitle="基于剩余预算与剩余天数反推" />
          <CardBody className="flex-1">
            <div className="space-y-4">
              {[
                {
                  label: '时间进度',
                  value: timeProgress * 100,
                  color: '#94a3b8',
                  hint: `已过 ${elapsedDays} 天`,
                },
                {
                  label: '预算使用率',
                  value: totalUsage * 100,
                  color: '#e5484d',
                  hint: `已花 ${moneyShort(totalSpent)}`,
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12.5px] text-slate-700">{item.label}</span>
                    <span className="tabular text-[13px] font-medium text-slate-900">
                      {pct(item.value / 100)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={item.value} color={item.color} height={8} />
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">{item.hint}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50/60 px-4 py-3.5">
              <div className="text-[12px] font-medium text-rose-700">超支风险测算</div>
              <div className="mt-2 space-y-1.5 text-[12px] leading-6 text-slate-600">
                <div className="flex justify-between">
                  <span>剩余预算</span>
                  <b className="tabular">{money(totalLeft)}</b>
                </div>
                <div className="flex justify-between">
                  <span>剩余天数</span>
                  <b className="tabular">{remainingDays} 天</b>
                </div>
                <div className="flex justify-between">
                  <span>实际日均花费</span>
                  <b className="tabular text-rose-600">{money(Math.round(dailyBurn))}</b>
                </div>
                <div className="flex justify-between">
                  <span>安全日均上限</span>
                  <b className="tabular text-emerald-600">
                    {money(Math.round(safeDailyBurn))}
                  </b>
                </div>
                <div className="mt-1 flex justify-between border-t border-rose-200 pt-2">
                  <span>按当前节奏的预计超支</span>
                  <b className="tabular text-rose-600">{money(Math.round(expectedOver))}</b>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-[12px] font-medium text-slate-700">建议动作</div>
              <ul className="mt-2 space-y-2">
                {budgetActions.map((text) => (
                  <li
                    key={text}
                    className="flex items-start gap-2 text-[12px] leading-5 text-slate-600"
                  >
                    <span className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    {fill(text, alertVars)}
                  </li>
                ))}
              </ul>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 预算分布图 + 各维度预算 / 已使用对比 */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <ChartCard
            title="预算分布（各维度占比）"
            subtitle={`共 ${detailRows.length} 个维度 · 总预算 ${money(totalBudget)}`}
            extra={<Badge tone="info">占比合计 {pct(detailRows.reduce((s, r) => s + r.share, 0))}</Badge>}
          >
            {/* 环形图在上、图例在下。
                原来两栏横排时，图例列只剩约 197px —— 扣掉色点、金额、占比后
                留给名称的只有 67px，而「Dimension 01」需要 79px，10 条全部被截断。
                改成上下堆叠后图例拿到整卡宽度（约 382px），名称有 250px 以上余量。 */}
            <div className="space-y-3.5">
              <div className="mx-auto w-full max-w-[280px]">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={detailRows}
                      dataKey="budget"
                      nameKey="name"
                      innerRadius={46}
                      outerRadius={78}
                      paddingAngle={1.5}
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {detailRows.map((row) => (
                        <Cell key={row.key} fill={row.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      {...tooltipProps}
                      formatter={(value: any) => money(Number(value))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5">
                {detailRows.map((row) => (
                  <div key={row.key} className="flex items-center gap-2 text-[12px]">
                    <span
                      className="inline-block h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: row.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-slate-600">{row.name}</span>
                    <span className="tabular shrink-0 text-slate-500">
                      {moneyShort(row.budget)}
                    </span>
                    <span className="tabular w-12 shrink-0 text-right font-medium text-slate-700">
                      {pct(row.share)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <ChartNote>
              <RichText
                text={fill(insights.budget.distributionNote, {
                  top5: pct(topFiveShare),
                  bottom5: pct(1 - topFiveShare),
                })}
              />
            </ChartNote>
          </ChartCard>
        </div>

        <div className="xl:col-span-3">
          <ChartCard
            title="各维度预算 vs 已使用"
            subtitle="灰色为维度预算，彩色为已使用金额"
            extra={<Badge tone="idle">按预算额排序</Badge>}
          >
            <ResponsiveContainer width="100%" height={392}>
              <BarChart
                data={compareData}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
                barGap={2}
                barCategoryGap="22%"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridStroke} />
                <XAxis
                  type="number"
                  tick={axisTick}
                  tickLine={false}
                  axisLine={axisLine}
                  tickFormatter={moneyTick}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ ...axisTick, fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={82}
                />
                <Tooltip
                  {...tooltipProps}
                  cursor={barCursor}
                  formatter={(value: any) => money(Number(value))}
                />
                <Legend {...legendProps} />
                <Bar dataKey="budget" name="维度预算" fill="#dbe4f3" radius={[0, 4, 4, 0]} maxBarSize={9} />
                <Bar dataKey="spent" name="已使用" radius={[0, 4, 4, 0]} maxBarSize={9}>
                  {compareData.map((row) => (
                    <Cell key={row.name} fill={row.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <ChartNote>
              <RichText
                text={fill(insights.budget.compareNote, {
                  overName: alertVars.overName,
                  overAmount: alertVars.overAmount,
                  lowName: alertVars.lowName,
                  lowRate: alertVars.lowRate,
                })}
              />
            </ChartNote>
          </ChartCard>
        </div>
      </div>

      {/* 维度明细 */}
      <Card className="mt-4">
        <CardHeader
          title="预算维度明细"
          subtitle="每个维度的预算、已使用、剩余、使用率与预算占比；额度均为演示用虚构数字"
          extra={
            <span className="text-[11px] text-slate-400">
              合计 {money(totalSpent)} / {money(totalBudget)}
            </span>
          }
        />
        <div className="overflow-x-auto">
          <table className="grid-table">
            <thead>
              <tr>
                <th>预算维度</th>
                <th className="num">维度预算</th>
                <th className="num">已使用</th>
                <th className="num">剩余</th>
                <th className="min-w-[180px]">使用率</th>
                <th className="min-w-[170px]">预算占比</th>
              </tr>
            </thead>
            <tbody>
              {detailRows.map((row) => (
                <tr key={row.key}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="font-medium text-slate-800">{row.name}</span>
                    </div>
                  </td>
                  <td className="tabular num text-slate-600">{money(row.budget)}</td>
                  <td className="tabular num text-slate-800">{money(row.spent)}</td>
                  <td className={`tabular num ${row.over ? 'text-rose-600' : 'text-slate-500'}`}>
                    {row.over ? signedMoney(row.left) : money(row.left)}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <ProgressBar
                        value={row.rate * 100}
                        color={row.over ? '#e5484d' : row.color}
                        height={6}
                      />
                      <span
                        className={`tabular w-12 shrink-0 text-right text-[11px] ${
                          row.over ? 'text-rose-600 font-medium' : 'text-slate-500'
                        }`}
                      >
                        {pct(row.rate)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <ProgressBar value={row.share * 100} color={row.color} height={6} />
                      <span className="tabular w-12 shrink-0 text-right text-[11px] text-slate-500">
                        {pct(row.share)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50/70">
                <td className="font-medium text-slate-900">合计</td>
                <td className="tabular num font-medium text-slate-900">{money(totalBudget)}</td>
                <td className="tabular num font-medium text-slate-900">{money(totalSpent)}</td>
                <td className="tabular num font-medium text-slate-900">{money(totalLeft)}</td>
                <td className="tabular text-[11px] font-medium text-slate-700">
                  总使用率 {pct(totalUsage)}
                </td>
                <td className="tabular text-[11px] font-medium text-slate-700">占比合计 100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
        {overRow ? (
          <div className="border-t border-slate-100 px-5 py-3">
            <p className="text-[11.5px] leading-6 text-amber-700">
              <RichText
                text={fill(insights.budget.overspentNote, {
                  list: `${overRow.name}（超出 ${alertVars.overAmount}）`,
                  unusedName: alertVars.unusedName,
                  unused: alertVars.unused,
                })}
              />
            </p>
          </div>
        ) : null}
      </Card>

      {/* 分渠道 + 预警 */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="分渠道预算执行"
            subtitle="同一笔钱的另一种切法：按渠道看预算消耗"
          />
          <CardBody>
            <div className="space-y-4">
              {channelRows.map(({ channel, ratio, left }) => (
                <div key={channel.key}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <DotBadge color={channel.color}>{channel.name}</DotBadge>
                    <span className="tabular text-[12px] text-slate-500">
                      {moneyShort(channel.spent)}
                      <span className="mx-1 text-slate-300">/</span>
                      {moneyShort(channel.budget)}
                      <span
                        className={`ml-2 ${ratio > 0.7 ? 'text-rose-600' : 'text-slate-400'}`}
                      >
                        {pct(ratio)}
                      </span>
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <ProgressBar
                      value={ratio * 100}
                      color={ratio > totalUsage ? '#e5484d' : channel.color}
                      height={7}
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    剩余 {money(left)}　|　{channel.role}
                  </div>
                </div>
              ))}
            </div>
            <ChartNote>
              <RichText
                text={fill(insights.budget.channelNote, { rate: pct(totalUsage) })}
              />
            </ChartNote>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="预算预警清单"
            subtitle="按优先级排列，均已在风险分析页面登记"
            extra={<Badge tone="bad">{budgetAlerts.length} 项待跟进</Badge>}
          />
          <CardBody>
            <div className="space-y-3">
              {budgetAlerts.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 px-3.5 py-3"
                >
                  <Badge tone={item.level}>{item.tag}</Badge>
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-medium text-slate-800">
                      {fill(item.title, alertVars)}
                    </div>
                    <p className="mt-1 text-[11.5px] leading-5 text-slate-500">
                      {fill(item.desc, alertVars)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p className="text-[11.5px] leading-6 text-slate-500">
          <RichText
            text={fill(insights.budget.disclaimer, {
              budget: money(totalBudget),
              spent: money(totalSpent),
              channelBudget: money(budgetReconciliation.channelBudget),
              channelSpent: money(budgetReconciliation.channelSpent),
              diff: money(Math.abs(budgetReconciliation.budgetDiff) + Math.abs(budgetReconciliation.spentDiff)),
            })}
          />
        </p>
      </div>
    </>
  )
}
