import type { CSSProperties } from 'react'

// Recharts 的统一样式，保证 6 个页面里的图表看起来是同一套设计
//
// 原则：坐标轴尽量轻（无轴线、弱刻度色）、网格线压到几乎看不见、
// tooltip 用白底浮层，让数据本身成为画面里最重的部分。

export const axisTick = { fill: '#98a2b3', fontSize: 10.5 }

export const axisLine = { stroke: '#eef0f4' }

export const gridStroke = '#f0f2f6'

export const tooltipProps = {
  contentStyle: {
    borderRadius: 12,
    border: '1px solid #e9ebf0',
    boxShadow: '0 14px 34px -10px rgba(16, 24, 40, 0.18)',
    fontSize: 12,
    padding: '8px 11px',
    background: '#ffffff',
  } as CSSProperties,
  labelStyle: {
    color: '#667085',
    fontSize: 11,
    fontWeight: 500,
    marginBottom: 4,
  } as CSSProperties,
  itemStyle: {
    padding: '1.5px 0',
  } as CSSProperties,
}

export const legendProps = {
  iconType: 'circle' as const,
  iconSize: 6,
  wrapperStyle: { fontSize: 11.5, color: '#667085' },
}

/** 柱状图的悬浮高亮底色 */
export const barCursor = { fill: 'rgba(148, 163, 184, 0.1)' }

/** 折线图的悬浮竖线 */
export const lineCursor = { stroke: '#e4e7ec', strokeWidth: 1 }

export const CHART_HEIGHT = 260
export const CHART_HEIGHT_TALL = 320

/** Y 轴金额缩写 */
export function moneyTick(v: number): string {
  if (Math.abs(v) >= 1e8) return `${(v / 1e8).toFixed(1)}亿`
  if (Math.abs(v) >= 1e4) return `${Math.round(v / 1e4)}万`
  return String(v)
}

/** Y 轴数量缩写 */
export function countTick(v: number): string {
  if (Math.abs(v) >= 1e8) return `${(v / 1e8).toFixed(1)}亿`
  if (Math.abs(v) >= 1e4) return `${Math.round(v / 1e4)}万`
  return String(v)
}
