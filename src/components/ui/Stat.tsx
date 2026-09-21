import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge, type Tone } from './Badge'

/** 卡片里的迷你折线，纯 SVG 手绘，比图表库更轻 */
function Spark({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const w = 104
  const h = 30
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / span) * h
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const last = data[data.length - 1]
  const lastY = h - ((last - min) / span) * h
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <circle cx={w} cy={lastY} r="2.6" fill={color} />
    </svg>
  )
}

export interface StatCardProps {
  label: string
  value: string
  /** 数值下方的一行说明 */
  sub?: ReactNode
  /** 右上角徽标 */
  badge?: { text: string; tone: Tone }
  /** 迷你折线数据 */
  spark?: number[]
  sparkColor?: string
  icon?: LucideIcon
}

/**
 * 顶部核心指标卡。
 * 层级：图标 + 标签（次） → 数值（主，最大最重） → 说明（次）+ 迷你折线。
 */
export function StatCard({
  label,
  value,
  sub,
  badge,
  spark,
  sparkColor = '#3b82f6',
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="card card-pad card-hover fade-up">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {Icon ? (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
              <Icon size={13} strokeWidth={2} />
            </span>
          ) : null}
          <span className="truncate text-[11.5px] font-medium tracking-[0.01em] text-slate-500">
            {label}
          </span>
        </div>
        {badge ? <Badge tone={badge.tone}>{badge.text}</Badge> : null}
      </div>
      <div className="tabular mt-3 text-[27px] leading-none font-semibold tracking-[-0.02em] text-slate-900">
        {value}
      </div>
      <div className="mt-3.5 flex items-end justify-between gap-3">
        <div className="text-[11.5px] leading-5 text-slate-500">{sub}</div>
        {spark ? (
          <div className="shrink-0">
            <Spark data={spark} color={sparkColor} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

/** 紧凑型指标，用于卡片内的小格子 */
export function MiniStat({
  label,
  value,
  hint,
  tone = 'idle',
}: {
  label: string
  value: string
  hint?: string
  tone?: Tone
}) {
  const valueColor: Record<Tone, string> = {
    good: 'text-emerald-600',
    warn: 'text-amber-600',
    bad: 'text-rose-600',
    info: 'text-blue-600',
    idle: 'text-slate-900',
  }
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 transition-colors hover:border-slate-200 hover:bg-slate-50">
      <div className="text-[11px] leading-4 text-slate-500">{label}</div>
      <div
        className={`tabular mt-1.5 text-[17px] leading-none font-semibold tracking-[-0.01em] ${valueColor[tone]}`}
      >
        {value}
      </div>
      {hint ? <div className="mt-1.5 text-[11px] leading-4 text-slate-400">{hint}</div> : null}
    </div>
  )
}
