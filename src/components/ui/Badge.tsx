import type { ReactNode } from 'react'

export type Tone = 'good' | 'warn' | 'bad' | 'info' | 'idle'

const toneClass: Record<Tone, string> = {
  good: 'border-emerald-200/80 bg-emerald-50 text-emerald-700',
  warn: 'border-amber-200/80 bg-amber-50 text-amber-700',
  bad: 'border-rose-200/80 bg-rose-50 text-rose-700',
  info: 'border-blue-200/80 bg-blue-50 text-blue-700',
  idle: 'border-slate-200 bg-slate-50 text-slate-600',
}

/** 状态胶囊。统一高度与字号，保证同一行里的徽标视觉重量一致。 */
export function Badge({
  tone = 'idle',
  children,
  className = '',
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex h-[19px] items-center gap-1 rounded-full border px-2 text-[11px] leading-none font-medium tracking-[0.005em] whitespace-nowrap ${toneClass[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

/** 带颜色圆点的徽标，用于渠道名 */
export function DotBadge({
  color,
  children,
}: {
  color: string
  children: ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium whitespace-nowrap text-slate-700">
      <span
        className="inline-block h-2 w-2 shrink-0 rounded-full ring-2 ring-white"
        style={{ backgroundColor: color }}
      />
      {children}
    </span>
  )
}
