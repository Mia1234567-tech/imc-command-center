import { Fragment, type ReactNode } from 'react'

// ============================================================
// 把数据文件里的纯文本文案渲染出来，同时支持四种强调标记：
//
//   **文本**   加粗（继承当前颜色，等价于原来的 <b>）
//   !!文本!!   红色加粗，用于风险 / 超支这类负面数字
//   ++文本++   绿色加粗，用于达标 / 正向数字
//   %%文本%%   灰色加粗，用于次要数字
//
// 这样「文案」可以完整地放在数据文件里保持纯文本，
// 而「怎么强调」这种展示规则留在组件里，两者不混在一起。
// ============================================================

const MARKER_CLASS: Record<string, string | undefined> = {
  '**': undefined,
  '!!': 'text-rose-600',
  '++': 'text-emerald-600',
  '%%': 'text-slate-600',
}

const PATTERN = /(\*\*|!!|\+\+|%%)([\s\S]+?)\1/g

export function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = []
  let cursor = 0
  let key = 0
  let match: RegExpExecArray | null

  PATTERN.lastIndex = 0
  while ((match = PATTERN.exec(text)) !== null) {
    if (match.index > cursor) {
      parts.push(<Fragment key={key++}>{text.slice(cursor, match.index)}</Fragment>)
    }
    parts.push(
      <b key={key++} className={MARKER_CLASS[match[1]]}>
        {match[2]}
      </b>,
    )
    cursor = PATTERN.lastIndex
  }

  if (cursor < text.length) {
    parts.push(<Fragment key={key++}>{text.slice(cursor)}</Fragment>)
  }

  return <>{parts}</>
}
