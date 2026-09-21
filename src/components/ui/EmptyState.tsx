import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * 空状态。
 *
 * 三种用法：
 * 1. 表格没有数据 —— 放进一整行的 <td colSpan={n}> 里；
 * 2. 卡片内列表为空 —— 直接放在 CardBody 里，传 compact 减少留白；
 * 3. 图表没有数据点 —— 放在 ChartCard 的 body 里替掉图表。
 */
export function EmptyState({
  icon: Icon,
  title,
  hint,
  extra,
  compact = false,
  className = '',
}: {
  icon?: LucideIcon
  title: string
  hint?: string
  extra?: ReactNode
  compact?: boolean
  className?: string
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${compact ? 'px-4 py-7' : 'px-6 py-11'} ${className}`}
      role="status"
    >
      {Icon ? (
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
          <Icon size={17} strokeWidth={1.9} />
        </span>
      ) : null}
      <div className={`text-[12.5px] font-medium text-slate-700 ${Icon ? 'mt-3' : ''}`}>
        {title}
      </div>
      {hint ? (
        <p className="mt-1 max-w-[340px] text-[11.5px] leading-5 text-slate-400">{hint}</p>
      ) : null}
      {extra ? <div className="mt-3">{extra}</div> : null}
    </div>
  )
}

/** 表格里的空状态：自动补一个铺满所有列的单元格 */
export function EmptyTableRow({
  colSpan,
  icon,
  title,
  hint,
}: {
  colSpan: number
  icon?: LucideIcon
  title: string
  hint?: string
}) {
  return (
    <tr className="row-empty">
      <td colSpan={colSpan}>
        <EmptyState icon={icon} title={title} hint={hint} compact />
      </td>
    </tr>
  )
}
