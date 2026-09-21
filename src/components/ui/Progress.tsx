import type { Tone } from './Badge'

const fill: Record<Tone, string> = {
  good: 'bg-emerald-500',
  warn: 'bg-amber-500',
  bad: 'bg-rose-500',
  info: 'bg-blue-500',
  idle: 'bg-slate-300',
}

/** 横向进度条，value 传 0-100 */
export function ProgressBar({
  value,
  tone = 'info',
  color,
  height = 6,
  className = '',
}: {
  value: number
  tone?: Tone
  /** 传了颜色就用颜色，否则用 tone */
  color?: string
  height?: number
  className?: string
}) {
  const safe = Math.max(0, Math.min(100, value))
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-slate-100 ${className}`}
      style={{ height }}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ease-out ${color ? '' : fill[tone]}`}
        style={{ width: `${safe}%`, backgroundColor: color }}
      />
    </div>
  )
}

/** 带「实际 / 目标」标注的进度行 */
export function ProgressRow({
  label,
  left,
  right,
  value,
  tone = 'info',
  color,
}: {
  label: string
  left?: string
  right?: string
  value: number
  tone?: Tone
  color?: string
}) {
  return (
    <div className="group py-2.5">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[12.5px] font-medium text-slate-700">{label}</span>
        <span className="tabular text-[11.5px] text-slate-500">
          {left}
          {left && right ? <span className="mx-1 text-slate-300">/</span> : null}
          {right}
        </span>
      </div>
      <ProgressBar value={value} tone={tone} color={color} />
    </div>
  )
}
