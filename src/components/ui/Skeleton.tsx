import type { CSSProperties, ReactNode } from 'react'

// ============================================================
// 骨架屏
//
// 用法：在真实内容就位前用它占位，形状与实际内容保持一致，
// 这样内容出现时不会出现「跳一下」的布局位移。
// 流光动画定义在 src/index.css 的 .skeleton 里。
// ============================================================

export function Skeleton({
  className = '',
  style,
  rounded = 8,
}: {
  className?: string
  style?: CSSProperties
  rounded?: number
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ borderRadius: rounded, ...style }}
      aria-hidden="true"
    />
  )
}

/** 多行文本占位，最后一行略短，更像真实段落 */
export function SkeletonText({
  lines = 2,
  className = '',
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-3"
          style={{ width: index === lines - 1 && lines > 1 ? '62%' : '100%' }}
        />
      ))}
    </div>
  )
}

function SkeletonCard({
  className = '',
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <div className={`card overflow-hidden ${className}`}>{children}</div>
}

/**
 * 页面级骨架屏，形状与六个页面的通用布局一致：
 * 页头 → 四张指标卡 → 一个主图 + 一个侧卡 → 一张明细表
 */
export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="页面加载中">
      {/* 页头 */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-6 w-[150px]" rounded={7} />
          <Skeleton className="h-[19px] w-[92px]" rounded={6} />
        </div>
        <Skeleton className="mt-2.5 h-3.5 w-[520px] max-w-full" />
      </div>

      {/* 指标卡 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index}>
            <div className="px-5 py-[18px]">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-3 w-[92px]" />
                <Skeleton className="h-[19px] w-[56px]" rounded={999} />
              </div>
              <Skeleton className="mt-3.5 h-7 w-[124px]" rounded={8} />
              <div className="mt-4 flex items-end justify-between gap-3">
                <Skeleton className="h-3 w-[132px]" />
                <Skeleton className="h-[30px] w-[104px]" rounded={6} />
              </div>
            </div>
          </SkeletonCard>
        ))}
      </div>

      {/* 图表区 */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SkeletonCard className="xl:col-span-2">
          <div className="border-b border-slate-100 px-5 py-3.5">
            <Skeleton className="h-3.5 w-[132px]" />
            <Skeleton className="mt-2 h-3 w-[198px]" />
          </div>
          <div className="px-5 py-4">
            <Skeleton className="h-[280px] w-full" rounded={12} />
            <Skeleton className="mt-3 h-3 w-full" />
          </div>
        </SkeletonCard>

        <SkeletonCard>
          <div className="border-b border-slate-100 px-5 py-3.5">
            <Skeleton className="h-3.5 w-[96px]" />
          </div>
          <div className="px-5 py-4">
            <Skeleton className="mx-auto h-[176px] w-[176px]" rounded={999} />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between gap-3">
                  <Skeleton className="h-3 w-[78px]" />
                  <Skeleton className="h-3 w-[58px]" />
                </div>
              ))}
            </div>
          </div>
        </SkeletonCard>
      </div>

      {/* 明细表 */}
      <SkeletonCard className="mt-4">
        <div className="border-b border-slate-100 px-5 py-3.5">
          <Skeleton className="h-3.5 w-[112px]" />
        </div>
        <div className="px-5 py-4">
          <div className="space-y-2.5">
            <Skeleton className="h-7 w-full" rounded={10} />
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-[34px] w-full" rounded={6} />
            ))}
          </div>
        </div>
      </SkeletonCard>
    </div>
  )
}
