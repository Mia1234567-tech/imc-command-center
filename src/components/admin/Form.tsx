import type { ReactNode } from 'react'

// ============================================================
// 后台管理专用的表单控件
//
// 只服务于 /admin 下面的页面，前台页面完全用不到，所以单独放一个文件：
// 视觉沿用现有设计令牌（白底、浅灰、蓝色主色、圆角、轻边框），不做动画。
// ============================================================

const controlClass =
  'h-9 w-full rounded-[10px] border border-slate-200 bg-white px-2.5 text-[12.5px] text-slate-800 transition-colors outline-none placeholder:text-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400'

/** 表格里用的紧凑输入框 */
const cellClass =
  'h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[12px] text-slate-800 transition-colors outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100'

export function TextInput({
  value,
  onChange,
  placeholder,
  field,
  disabled,
  className = '',
  cell = false,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** 渲染成 data-field，方便自动化测试定位 */
  field?: string
  disabled?: boolean
  className?: string
  /** 表格内使用紧凑样式 */
  cell?: boolean
}) {
  return (
    <input
      type="text"
      value={value}
      disabled={disabled}
      data-field={field}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={`${cell ? cellClass : controlClass} ${className}`}
    />
  )
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  field,
  disabled,
  className = '',
  cell = false,
}: {
  value: number | ''
  onChange: (value: string) => void
  min?: number
  max?: number
  step?: number
  field?: string
  disabled?: boolean
  className?: string
  /** 表格内使用紧凑样式 */
  cell?: boolean
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      data-field={field}
      onChange={(event) => onChange(event.target.value)}
      className={`${cell ? cellClass : controlClass} tabular text-right ${className}`}
    />
  )
}

export function DateInput({
  value,
  onChange,
  field,
  cell = false,
  className = '',
}: {
  value: string
  onChange: (value: string) => void
  field?: string
  cell?: boolean
  className?: string
}) {
  return (
    <input
      type="date"
      value={value}
      data-field={field}
      onChange={(event) => onChange(event.target.value)}
      className={`${cell ? cellClass : controlClass} tabular ${className}`}
    />
  )
}

export function Select({
  value,
  onChange,
  options,
  field,
  cell = false,
  className = '',
}: {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  field?: string
  cell?: boolean
  className?: string
}) {
  return (
    <select
      value={value}
      data-field={field}
      onChange={(event) => onChange(event.target.value)}
      className={`${cell ? cellClass : controlClass} ${className}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

/** 表单里的一行：标签 + 控件 + 说明 */
export function Field({
  label,
  hint,
  children,
  width = 'md',
}: {
  label: string
  hint?: string
  children: ReactNode
  /** 用来控制栅格宽度 */
  width?: 'sm' | 'md' | 'lg' | 'full'
}) {
  const widthClass = {
    sm: 'sm:col-span-1',
    md: 'sm:col-span-1',
    lg: 'sm:col-span-2',
    full: 'sm:col-span-2',
  }[width]

  return (
    <div className={widthClass}>
      <label className="mb-1.5 block text-[11.5px] font-medium text-slate-600">{label}</label>
      {children}
      {hint ? <p className="mt-1.5 text-[11px] leading-5 text-slate-400">{hint}</p> : null}
    </div>
  )
}

export function Button({
  children,
  onClick,
  tone = 'ghost',
  disabled = false,
  field,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  tone?: 'primary' | 'ghost' | 'danger' | 'quiet'
  disabled?: boolean
  field?: string
  type?: 'button' | 'submit'
}) {
  const toneClass: Record<string, string> = {
    primary:
      'border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700',
    ghost: 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
    danger: 'border border-rose-200 bg-white text-rose-600 hover:border-rose-300 hover:bg-rose-50',
    quiet: 'border border-transparent bg-transparent text-slate-500 hover:bg-slate-100',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-field={field}
      className={`inline-flex h-8 items-center gap-1.5 rounded-[10px] px-3 text-[12px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${toneClass[tone]}`}
    >
      {children}
    </button>
  )
}

/** 提示条：用于「演示数据」「对账差额」「口径不一致」这类说明 */
export function Notice({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'warn' | 'good'
  children: ReactNode
}) {
  const toneClass: Record<string, string> = {
    info: 'border-blue-200 bg-blue-50/70 text-blue-800',
    warn: 'border-amber-200 bg-amber-50/70 text-amber-800',
    good: 'border-emerald-200 bg-emerald-50/70 text-emerald-800',
  }
  return (
    <div className={`rounded-xl border px-3.5 py-2.5 text-[11.5px] leading-5 ${toneClass[tone]}`}>
      {children}
    </div>
  )
}

/**
 * 保存操作条：后台每个管理页都用同一个。
 * dirty 为 true 时提示「有未保存的更改」，避免改完忘了保存。
 */
export function SaveBar({
  dirty,
  onSave,
  onCancel,
  extra,
}: {
  dirty: boolean
  onSave: () => void
  onCancel: () => void
  extra?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
      <div className="flex items-center gap-2 text-[11.5px]">
        {dirty ? (
          <span className="inline-flex items-center gap-1.5 text-amber-700">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
            有未保存的更改
          </span>
        ) : (
          <span className="text-slate-400">当前显示的就是已保存的数据</span>
        )}
        {extra}
      </div>
      <div className="flex items-center gap-2">
        <Button tone="ghost" onClick={onCancel} disabled={!dirty} field="cancel">
          放弃更改
        </Button>
        <Button tone="primary" onClick={onSave} disabled={!dirty} field="save">
          保存
        </Button>
      </div>
    </div>
  )
}
