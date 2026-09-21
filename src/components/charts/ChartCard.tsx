import type { ReactNode } from 'react'
import { Card, CardBody, CardHeader } from '../ui/Card'

export function ChartCard({
  title,
  subtitle,
  extra,
  children,
  bodyClassName = '',
  fill = true,
}: {
  title: string
  subtitle?: string
  extra?: ReactNode
  children: ReactNode
  bodyClassName?: string
  /**
   * 是否撑满父容器高度。
   * 当图表卡是网格的直接子项时用默认值 true，可以和旁边的卡片底部对齐；
   * 当它被放在「一列里叠好几张卡」的容器中时必须传 false，
   * 否则它会撑满整列高度，把后面的卡片挤出容器造成重叠。
   */
  fill?: boolean
}) {
  return (
    <Card className={`flex flex-col ${fill ? 'h-full' : ''}`}>
      <CardHeader title={title} subtitle={subtitle} extra={extra} />
      <CardBody className={`flex-1 ${bodyClassName}`}>{children}</CardBody>
    </Card>
  )
}

/** 图表下方的图例说明 */
export function ChartNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 border-t border-slate-100 pt-3 text-[11.5px] leading-5 text-slate-500">
      {children}
    </p>
  )
}
