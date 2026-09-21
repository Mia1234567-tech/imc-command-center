import type { ReactNode } from 'react'
import { RichText } from './RichText'

/**
 * 卡片容器。
 *
 * hoverable=true 时鼠标扫过会有轻微上浮与阴影加深，
 * 用于「信息块」类卡片；纯容器卡片保持静置，避免整页都在动。
 */
export function Card({
  children,
  className = '',
  hoverable = false,
}: {
  children: ReactNode
  className?: string
  hoverable?: boolean
}) {
  return (
    <section className={`card overflow-hidden ${hoverable ? 'card-hover' : ''} ${className}`}>
      {children}
    </section>
  )
}

export function CardHeader({
  title,
  subtitle,
  extra,
}: {
  title: string
  subtitle?: string
  extra?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
      <div className="min-w-0">
        <h3 className="text-[13.5px] leading-5 font-semibold tracking-[-0.005em] text-slate-900">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-0.5 text-[11.5px] leading-5 text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {extra ? <div className="shrink-0">{extra}</div> : null}
    </header>
  )
}

export function CardBody({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>
}

/**
 * 页面标题。
 * 层级：中文大标题 → 英文标签胶囊 → 一句话说明。
 * desc 走 RichText，所以文案里的 ** / !! 强调标记能正常加粗。
 */
export function PageHeader({
  zh,
  en,
  desc,
  extra,
}: {
  zh: string
  en: string
  desc: string
  extra?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <h1 className="text-[21px] leading-tight font-semibold tracking-[-0.015em] text-slate-900">
            {zh}
          </h1>
          <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10.5px] font-medium tracking-[0.02em] text-slate-500">
            {en}
          </span>
        </div>
        <p className="mt-2 max-w-3xl text-[12.5px] leading-6 text-slate-500">
          <RichText text={desc} />
        </p>
      </div>
      {extra ? <div className="shrink-0">{extra}</div> : null}
    </div>
  )
}
