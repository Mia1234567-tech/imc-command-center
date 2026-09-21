// ============================================================
// 文案占位符替换
// 数据文件里的结论文案可以写成模板，用 {name} 占位，
// 由页面在渲染时把真实数字填进去。
// 这样做的好处：数字永远由数据算出来，不会出现「文案里的数字和表格对不上」。
// ============================================================

export function fill(
  template: string,
  values: Record<string, string | number> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (matched, key: string) =>
    values[key] === undefined ? matched : String(values[key]),
  )
}
