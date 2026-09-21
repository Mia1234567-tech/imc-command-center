import { CalendarRange, Target, Users } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardBody, CardHeader, PageHeader } from '../components/ui/Card'
import { Badge, DotBadge } from '../components/ui/Badge'
import { MiniStat } from '../components/ui/Stat'
import { ProgressBar } from '../components/ui/Progress'
import { ChartCard, ChartNote } from '../components/charts/ChartCard'
import { tooltipProps } from '../components/charts/theme'
import { RichText } from '../components/ui/RichText'
import { fill } from '../utils/text'
import {
  campaign,
  channels,
  insights,
  phases,
  platformAudiences,
} from '../data'
import { kpiItems } from '../utils/kpi'
import { elapsedDays, remainingDays, timeProgress, totalDays } from '../utils/metrics'
import {
  achieve,
  countShort,
  moneyShort,
  num,
  pct,
  signedPct,
  wan,
} from '../utils/format'
import { budgetGapPp, budgetProgress } from '../utils/metrics'
import { phaseStatusMeta } from '../utils/labels'

const phaseColor: Record<string, string> = {
  prep: '#94a3b8',
  warmup: '#60a5fa',
  burst: '#3b82f6',
  closing: '#cbd5e1',
}

const phaseDays = phases.map((phase) => {
  const start = new Date(`${phase.startDate}T00:00:00Z`).getTime()
  const end = new Date(`${phase.endDate}T00:00:00Z`).getTime()
  const days = Math.round((end - start) / 86_400_000) + 1
  return { ...phase, days, width: (days / totalDays) * 100 }
})

/** 从 KPI 数据里取某一项（目标值用于「核心目标」卡片） */
const kpiOf = (key: 'impressions' | 'clicksEngagements' | 'a3' | 'ti' | 'search') =>
  kpiItems.find((item) => item.key === key)!

const totalImpressionsNow = channels.reduce((sum, channel) => sum + channel.impressions, 0)

/** 三个平台的曝光达成率，用于下方结论文案 */
const douyinAchieve = achieve(
  channels.find((c) => c.key === 'douyin')!.impressions,
  channels.find((c) => c.key === 'douyin')!.targetImpressions,
)
const xiaohongshuAchieve = achieve(
  channels.find((c) => c.key === 'xiaohongshu')!.impressions,
  channels.find((c) => c.key === 'xiaohongshu')!.targetImpressions,
)
const shipinhaoAchieve = achieve(
  channels.find((c) => c.key === 'shipinhao')!.impressions,
  channels.find((c) => c.key === 'shipinhao')!.targetImpressions,
)

const douyinShare =
  channels.find((c) => c.key === 'douyin')!.impressions / totalImpressionsNow

/** 本期曝光结构：三个平台各自的曝光量与占比 */
const channelImpressionStructure = channels.map((channel) => ({
  name: channel.shortName,
  value: channel.impressions,
  color: channel.color,
  share: channel.impressions / totalImpressionsNow,
  achieveRate: achieve(channel.impressions, channel.targetImpressions),
}))

export default function CampaignOverview() {
  return (
    <>
      <PageHeader
        zh="Campaign Overview"
        en="Campaign 总览"
        desc="这一次 Campaign 的整体设定：目标、人群、节奏与三个渠道的分工。"
        extra={
          <div className="flex items-center gap-2">
            <Badge tone="info">{campaign.status}</Badge>
            <Badge tone="idle">{campaign.code}</Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* 档案 */}
        <Card className="xl:col-span-2">
          <CardHeader title="Campaign 档案" subtitle="基本信息与传播策略" />
          <CardBody>
            <h2 className="text-[17px] leading-6 font-medium text-slate-900">
              {campaign.name}
            </h2>
            <p className="mt-2 text-[13px] leading-6 text-slate-500">
              {campaign.description}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              {[
                ['品牌', campaign.brand],
                ['产品', campaign.product],
                ['Campaign 编号', campaign.code],
                ['项目负责人', campaign.owner],
                ['项目团队', campaign.team],
                ['执行周期', `${campaign.startDate} ~ ${campaign.endDate}（${totalDays} 天）`],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-[11px] text-slate-400">{label}</div>
                  <div className="mt-0.5 text-[12.5px] leading-5 text-slate-700">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-blue-700">
                <Target size={14} />
                营销目标
              </div>
              <p className="mt-1.5 text-[12.5px] leading-6 text-slate-600">
                {campaign.objective}
              </p>
            </div>

            <div className="mt-4">
              <div className="text-[12px] font-medium text-slate-700">核心传播信息</div>
              <ul className="mt-2 space-y-1.5">
                {campaign.keyMessages.map((message) => (
                  <li
                    key={message}
                    className="flex items-start gap-2 text-[12.5px] leading-5 text-slate-600"
                  >
                    <span className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    {message}
                  </li>
                ))}
              </ul>
            </div>
          </CardBody>
        </Card>

        {/* 目标 */}
        <Card className="flex flex-col">
          <CardHeader
            title="核心目标"
            subtitle="整个 Campaign 的终期目标值"
            extra={<Badge tone="idle">92 天周期</Badge>}
          />
          <CardBody className="flex-1">
            <div className="grid grid-cols-2 gap-3">
              <MiniStat
                label="总预算"
                value={moneyShort(campaign.totalBudget)}
                hint={`已使用 ${pct(budgetProgress)}`}
              />
              <MiniStat
                label="目标曝光"
                value={countShort(campaign.targetImpressions)}
                hint="三渠道合计"
              />
              <MiniStat
                label="目标点击互动"
                value={countShort(kpiOf('clicksEngagements').target)}
                hint="点击 + 互动合计"
              />
              <MiniStat
                label="目标 A3"
                value={countShort(kpiOf('a3').target)}
                hint="抖音种草人群累计"
              />
              <MiniStat
                label="目标 TI"
                value={countShort(kpiOf('ti').target)}
                hint="小红书目标人群累计"
              />
              <MiniStat
                label="目标平台搜索"
                value={countShort(kpiOf('search').target)}
                hint="抖音 + 小红书合计"
              />
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3">
              <div className="text-[12px] font-medium text-slate-700">当前进度对照</div>
              <div className="mt-2.5 space-y-2.5">
                {[
                  { label: '时间进度', value: timeProgress, color: '#94a3b8' },
                  { label: '预算执行率', value: budgetProgress, color: '#e5484d' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="tabular text-slate-600">{pct(item.value)}</span>
                    </div>
                    <div className="mt-1.5">
                      <ProgressBar value={item.value * 100} color={item.color} height={5} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2.5 text-[11px] leading-5 text-slate-500">
                已执行 {elapsedDays} 天、剩余 {remainingDays} 天，预算执行率比时间进度快{' '}
                <b className="text-rose-600">{signedPct(budgetGapPp)}</b>。
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 时间轴 */}
      <Card className="mt-4">
        <CardHeader
          title="执行节奏"
          subtitle="四个阶段的时长占比与当前推进位置"
          extra={
            <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <CalendarRange size={13} />
              {campaign.startDate} ~ {campaign.endDate}
            </span>
          }
        />
        <CardBody>
          <div className="relative pt-1 pb-6">
            <div className="flex h-10 w-full overflow-hidden rounded-xl">
              {phaseDays.map((phase) => (
                <div
                  key={phase.key}
                  className="group relative flex items-center justify-center border-r border-white/70 last:border-r-0"
                  style={{
                    width: `${phase.width}%`,
                    backgroundColor: phaseColor[phase.key],
                    opacity: phase.status === 'todo' ? 0.55 : 1,
                  }}
                  title={`${phase.name}　${phase.startDate} ~ ${phase.endDate}`}
                >
                  <span className="truncate px-2 text-[11px] font-medium text-white">
                    {phase.days} 天
                  </span>
                </div>
              ))}
            </div>

            {/* 今天的位置 */}
            <div
              className="pointer-events-none absolute top-0 -translate-x-1/2"
              style={{ left: `${Math.min(Math.max(timeProgress, 0), 1) * 100}%` }}
            >
              <div className="h-12 w-[2px] rounded-full bg-rose-500" />
            </div>
            <div
              className="pointer-events-none absolute top-[52px] -translate-x-1/2"
              style={{ left: `${Math.min(Math.max(timeProgress, 0), 1) * 100}%` }}
            >
              <div className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-medium whitespace-nowrap text-white">
                今天 · 第 {elapsedDays} 天
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {phaseDays.map((phase) => (
              <div
                key={phase.key}
                className={`rounded-xl border px-3.5 py-3 ${
                  phase.status === 'active'
                    ? 'border-blue-200 bg-blue-50/50'
                    : 'border-slate-100 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium text-slate-800">
                    {phase.name}
                  </span>
                  <Badge tone={phaseStatusMeta[phase.status].tone}>
                    {phaseStatusMeta[phase.status].label}
                  </Badge>
                </div>
                <div className="tabular mt-1 text-[11px] text-slate-400">
                  {phase.startDate.slice(5)} ~ {phase.endDate.slice(5)}　·　{phase.days} 天
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <ProgressBar
                    value={phase.progress}
                    tone={phase.status === 'active' ? 'info' : phase.status === 'done' ? 'good' : 'idle'}
                    height={5}
                  />
                  <span className="tabular w-9 shrink-0 text-right text-[11px] text-slate-500">
                    {phase.progress}%
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-5 text-slate-400">
                  {phase.focus}
                </p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* 分平台目标人群 */}
      <Card className="mt-4">
        <CardHeader
          title="目标人群画像（分平台）"
          subtitle="各平台使用自己的人群资产体系与标签圈人，标签口径不通用"
          extra={
            <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Users size={13} />
              {platformAudiences.length} 个平台 · 共 {countShort(platformAudiences.reduce((a, p) => a + p.size, 0))} 人
            </span>
          }
        />
        <CardBody>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {platformAudiences.map((audience) => {
              const channel = channels.find((c) => c.key === audience.channel)
              return (
                <div
                  key={audience.channel}
                  className="rounded-xl border border-slate-100 px-4 py-3.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <DotBadge color={channel?.color ?? '#94a3b8'}>
                        {channel?.name ?? audience.channel}
                      </DotBadge>
                      <span className="text-[12px] text-slate-400">{audience.framework}</span>
                    </div>
                    <span
                      className="rounded-md px-2 py-0.5 text-[11px] font-medium text-white"
                      style={{ backgroundColor: channel?.color ?? '#94a3b8' }}
                    >
                      {audience.assetCode}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-end justify-between gap-3">
                    <div>
                      <div className="text-[13px] font-medium text-slate-800">
                        {audience.assetName}
                      </div>
                      <div className="tabular mt-1 text-[19px] leading-none font-medium text-slate-900">
                        {wan(audience.size)}
                        <span className="ml-1 text-[11px] font-normal text-slate-400">人</span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400">终期目标规模</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">占目标人群</div>
                      <div className="tabular text-[13px] font-medium text-slate-700">
                        {pct(audience.share)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <ProgressBar
                      value={audience.share * 100}
                      color={channel?.color ?? '#3b82f6'}
                      height={5}
                    />
                  </div>

                  <div className="mt-3.5 space-y-2">
                    {audience.profile.map((item) => (
                      <div key={item.label}>
                        <div className="flex items-baseline justify-between gap-2 text-[11.5px]">
                          <span className="text-slate-600">{item.label}</span>
                          <span className="tabular text-slate-400">{pct(item.value)}</span>
                        </div>
                        <div className="mt-1">
                          <ProgressBar
                            value={item.value * 100}
                            color={channel?.color ?? '#3b82f6'}
                            height={4}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-3 text-[11.5px] leading-5 text-slate-500">
                    {audience.note}
                  </p>
                  <p className="mt-1.5 rounded-lg bg-slate-50 px-2.5 py-2 text-[11.5px] leading-5 text-slate-600">
                    <span className="font-medium text-slate-700">投放策略：</span>
                    {audience.strategy}
                  </p>
                </div>
              )
            })}
          </div>
          <ChartNote>
              <RichText text={insights.campaign.audienceNote} />
            </ChartNote>
        </CardBody>
      </Card>

      {/* 渠道曝光结构 + 分工 */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title="渠道曝光结构"
          subtitle={`本期累计 ${countShort(totalImpressionsNow)} 次 · 达成率对应终期目标`}
          bodyClassName="pt-2"
        >
          <ResponsiveContainer width="100%" height={196}>
            <PieChart>
              <Pie
                data={channelImpressionStructure}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={82}
                paddingAngle={2}
                stroke="#ffffff"
                strokeWidth={2}
              >
                {channelImpressionStructure.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip
                {...tooltipProps}
                formatter={(value: any) => `${num(Number(value))} 次`}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-1 space-y-2">
            {channelImpressionStructure.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-[12px]">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="min-w-0 flex-1 truncate text-slate-600">{item.name}</span>
                <span className="tabular shrink-0 text-slate-500">{countShort(item.value)} 次</span>
                <span className="tabular w-12 shrink-0 text-right font-medium text-slate-700">
                  {pct(item.share)}
                </span>
                <span className="tabular w-20 shrink-0 text-right text-rose-600">
                  达成 {pct(item.achieveRate, 2)}
                </span>
              </div>
            ))}
          </div>

          <ChartNote>
            <RichText
              text={fill(insights.campaign.exposureNote, {
                douyin: pct(douyinAchieve, 2),
                douyinShare: pct(douyinShare),
                xiaohongshu: pct(xiaohongshuAchieve, 2),
                shipinhao: pct(shipinhaoAchieve, 2),
              })}
            />
          </ChartNote>
        </ChartCard>

        <Card className="flex flex-col">
          <CardHeader title="渠道分工" subtitle="各平台承担的营销角色与合作模式" />
          <CardBody className="flex-1 space-y-3">
            {channels.map((channel) => (
              <div
                key={channel.key}
                className="rounded-xl border border-slate-100 px-3.5 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <DotBadge color={channel.color}>{channel.name}</DotBadge>
                    <Badge tone={channel.kolCooperation ? 'info' : 'idle'}>
                      {channel.kolCooperation ? '官方账号 + 达人合作' : '官方账号自运营'}
                    </Badge>
                  </div>
                  <Badge tone="idle">{channel.role}</Badge>
                </div>
                <p className="mt-1.5 text-[11.5px] leading-5 text-slate-500">
                  {channel.note}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                  <span>
                    预算 <b className="tabular text-slate-600">{moneyShort(channel.budget)}</b>
                  </span>
                  <span>
                    曝光达成{' '}
                    <b
                      className={`tabular ${
                        achieve(channel.impressions, channel.targetImpressions) >= 0.6
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {pct(achieve(channel.impressions, channel.targetImpressions))}
                    </b>
                  </span>
                  <span>
                    曝光 <b className="tabular text-slate-600">{countShort(channel.impressions)}</b>
                  </span>
                  <span>
                    点击 <b className="tabular text-slate-600">{countShort(channel.clicks)}</b>
                  </span>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </>
  )
}
