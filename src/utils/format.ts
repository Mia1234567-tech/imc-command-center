// ============================================================
// 数字、金额、百分比的统一格式化
// 全站所有数字都走这里，避免同一个数在一处显示 1.2 万、另一处显示 12000
// ============================================================

export function num(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return '-'
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

/** ¥1,234,567 */
export function money(n: number): string {
  return `¥${num(Math.round(n))}`
}

/** 万位保留一位小数并加千分位，避免出现「¥1338.0万」这种读不出量级的写法 */
function wanValue(n: number, digits: number): string {
  return (n / 1e4).toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

/** ¥123.5万 / ¥1,234.5万 / ¥1.20亿 —— 用于卡片上的大数字 */
export function moneyShort(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1e8) return `¥${(n / 1e8).toFixed(2)}亿`
  if (abs >= 1e4) return `¥${wanValue(n, 1)}万`
  return `¥${num(Math.round(n))}`
}

/** 1234.5万 / 1.20亿 —— 用于曝光、互动这类大数字 */
export function countShort(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1e8) return `${(n / 1e8).toFixed(2)}亿`
  if (abs >= 1e4) return `${wanValue(n, 1)}万`
  return num(Math.round(n))
}

/**
 * 强制换算成「万」为单位，例如 1864000 -> "186.4万"
 * 用于粉丝量这类希望统一口径展示的字段
 */
export function wan(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return '-'
  return `${wanValue(n, digits)}万`
}

/** 0.6543 -> "65.4%" */
export function pct(v: number, digits = 1): string {
  if (!Number.isFinite(v)) return '-'
  return `${(v * 100).toFixed(digits)}%`
}

/** 已经带 % 的数值，例如 4.02 -> "4.0%" */
export function pctValue(v: number, digits = 1): string {
  return `${v.toFixed(digits)}%`
}

/** 达成率：实际 / 目标 */
export function achieve(actual: number, target: number): number {
  if (!target) return 0
  return actual / target
}

/** '2026-09-20' -> '09/20' */
export function mmdd(iso: string): string {
  const parts = iso.split('-')
  return `${parts[1]}/${parts[2]}`
}

/** '2026-09-20' -> '9月20日' */
export function cnDate(iso: string): string {
  const parts = iso.split('-')
  return `${Number(parts[1])}月${Number(parts[2])}日`
}

/** 金额差额，带正负号：+¥12,000 / -¥3,200 */
export function signedMoney(n: number): string {
  const sign = n > 0 ? '+' : n < 0 ? '-' : ''
  return `${sign}¥${num(Math.abs(Math.round(n)))}`
}

export function signedPct(v: number, digits = 1): string {
  const sign = v > 0 ? '+' : v < 0 ? '-' : ''
  return `${sign}${Math.abs(v * 100).toFixed(digits)}pp`
}

/**
 * 差值（单位：个百分点）。
 * 两个百分数相减的场景用它，比 pct() 更准确 —— 那是「占比」，这是「百分点差」。
 */
export function pp(v: number, digits = 1): string {
  return `${(v * 100).toFixed(digits)}pp`
}
