import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { Card, CardHeader, PageHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import {
  Button,
  DateInput,
  Notice,
  SaveBar,
  Select,
  TextInput,
} from '../../components/admin/Form'
import { risks } from '../../data'
import { useSave } from '../../hooks/useSave'
import { riskStatusMeta } from '../../utils/labels'
import { RISK_HIGH_MIN, RISK_MEDIUM_MIN, riskScore, judgeRiskLevel } from '../../utils/risk'
import type { RiskItem, RiskStatus } from '../../types'

// ============================================================
// 风险管理
//
// 支持新增 / 编辑 / 删除。字段里没有「风险等级」——
// 等级由「概率 × 影响」自动判定（重点 ≥ {RISK_HIGH_MIN} 分 / 中等 {RISK_MEDIUM_MIN}~14 分 / 一般 ≤ 6 分），
// 想改等级就改概率或影响，改完这里会实时重算。
//
// 后台保存的是完整风险数据；前台 Risk 页只展示最需要处理的 TOP 5。
// ============================================================

const SCORE_OPTIONS = [1, 2, 3, 4, 5].map((value) => ({ value: String(value), label: String(value) }))

const STATUS_OPTIONS = (Object.keys(riskStatusMeta) as RiskStatus[]).map((key) => ({
  value: key,
  label: riskStatusMeta[key].label,
}))

const levelName: Record<string, string> = {
  high: '重点风险',
  medium: '中等风险',
  low: '一般风险',
}
const levelTone: Record<string, 'bad' | 'warn' | 'good'> = {
  high: 'bad',
  medium: 'warn',
  low: 'good',
}

const clone = (rows: RiskItem[]): RiskItem[] => rows.map((row) => ({ ...row }))

function nextRiskId(rows: RiskItem[]): string {
  const max = rows.reduce((acc, row) => {
    const matched = /^R-(\d+)$/.exec(row.id)
    return matched ? Math.max(acc, Number(matched[1])) : acc
  }, 0)
  return `R-${String(max + 1).padStart(2, '0')}`
}

export default function AdminRisk() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<RiskItem[]>(() => clone(risks))
  const [saved, setSaved] = useState<RiskItem[]>(() => clone(risks))
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const localSave = useSave()

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)

  const update = (id: string, patch: Partial<RiskItem>) =>
    setDraft((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))

  const onAdd = () => {
    const today = new Date().toISOString().slice(0, 10)
    setDraft((prev) => [
      ...prev,
      {
        id: nextRiskId(prev),
        title: '新风险（写清场景与后果）',
        category: '待分类',
        probability: 3,
        impact: 3,
        status: 'open',
        owner: '待指派',
        mitigation: '待补充建议动作',
        openedAt: today,
        dueDate: today,
      },
    ])
  }

  const invalidRows = draft.filter((row) => !row.title.trim())

  const onSave = async () => {
    if (invalidRows.length) return
    // 保存到本机（localStorage）。失败时不刷新页面，把原因留在页面上。
    if (!(await localSave.push([['risks', draft]]))) return
    setSaved(clone(draft))
    window.location.reload()
  }

  const onCancel = () => {
    setDraft(clone(saved))
    setPendingDelete(null)
  }

  const counts = draft.reduce(
    (acc, row) => {
      const level = judgeRiskLevel(riskScore(row))
      acc[level] += 1
      return acc
    },
    { high: 0, medium: 0, low: 0 } as Record<string, number>,
  )

  return (
    <>
      <PageHeader
        zh="风险管理"
        en="Admin · Risk"
        desc={`共 ${draft.length} 项风险。风险等级不手填 —— 由「发生概率 × 影响程度」自动判定，保存后前台风险页（TOP 5 与摘要指标）会同步。`}
        extra={
          <div className="flex items-center gap-2">
            <Badge tone="bad">重点 {counts.high}</Badge>
            <Badge tone="warn">中等 {counts.medium}</Badge>
            <Badge tone="good">一般 {counts.low}</Badge>
            <Button tone="quiet" onClick={() => navigate('/admin')}>
              返回后台首页
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader
          title="风险清单"
          subtitle={`等级规则：风险分 = 概率 × 影响；≥ ${RISK_HIGH_MIN} 分为重点风险，${RISK_MEDIUM_MIN} ~ ${RISK_HIGH_MIN - 1} 分为中等风险，更低为一般风险`}
          extra={
            <Button tone="ghost" onClick={onAdd} field="add-row">
              <Plus size={13} />
              新增风险
            </Button>
          }
        />

        <div className="space-y-3 px-5 py-4">
          {draft.map((row) => {
            const score = riskScore(row)
            const level = judgeRiskLevel(score)
            return (
              <div
                key={row.id}
                data-row={row.id}
                className="rounded-xl border border-slate-100 px-4 py-3 transition-colors hover:border-slate-200"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-start gap-2">
                    <span className="tabular mt-2 shrink-0 text-[11px] text-slate-400">
                      {row.id}
                    </span>
                    <div className="min-w-0 flex-1">
                      <TextInput
                        value={row.title}
                        field="title"
                        onChange={(value) => update(row.id, { title: value })}
                      />
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge tone={levelTone[level]}>
                      {levelName[level]} · {score} 分
                    </Badge>
                    {pendingDelete === row.id ? (
                      <>
                        <Button
                          tone="danger"
                          field="delete-confirm"
                          onClick={() => {
                            setDraft((prev) => prev.filter((item) => item.id !== row.id))
                            setPendingDelete(null)
                          }}
                        >
                          确认删除
                        </Button>
                        <Button tone="quiet" onClick={() => setPendingDelete(null)}>
                          取消
                        </Button>
                      </>
                    ) : (
                      <Button
                        tone="danger"
                        field="delete-row"
                        onClick={() => setPendingDelete(row.id)}
                      >
                        <Trash2 size={12} />
                        删除
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-2.5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  <div>
                    <div className="mb-1 text-[10.5px] text-slate-400">发生概率</div>
                    <Select
                      value={String(row.probability)}
                      field="probability"
                      cell
                      options={SCORE_OPTIONS}
                      onChange={(value) => update(row.id, { probability: Number(value) })}
                    />
                  </div>
                  <div>
                    <div className="mb-1 text-[10.5px] text-slate-400">影响程度</div>
                    <Select
                      value={String(row.impact)}
                      field="impact"
                      cell
                      options={SCORE_OPTIONS}
                      onChange={(value) => update(row.id, { impact: Number(value) })}
                    />
                  </div>
                  <div>
                    <div className="mb-1 text-[10.5px] text-slate-400">状态</div>
                    <Select
                      value={row.status}
                      field="status"
                      cell
                      options={STATUS_OPTIONS}
                      onChange={(value) => update(row.id, { status: value as RiskStatus })}
                    />
                  </div>
                  <div>
                    <div className="mb-1 text-[10.5px] text-slate-400">负责人</div>
                    <TextInput
                      value={row.owner}
                      field="owner"
                      cell
                      onChange={(value) => update(row.id, { owner: value })}
                    />
                  </div>
                  <div>
                    <div className="mb-1 text-[10.5px] text-slate-400">处理截止日期</div>
                    <DateInput
                      value={row.dueDate}
                      field="dueDate"
                      cell
                      onChange={(value) => update(row.id, { dueDate: value })}
                    />
                  </div>
                  <div>
                    <div className="mb-1 text-[10.5px] text-slate-400">分类</div>
                    <TextInput
                      value={row.category}
                      field="category"
                      cell
                      onChange={(value) => update(row.id, { category: value })}
                    />
                  </div>
                </div>

                <div className="mt-2.5">
                  <div className="mb-1 text-[10.5px] text-slate-400">建议动作</div>
                  <textarea
                    value={row.mitigation}
                    data-field="mitigation"
                    rows={2}
                    onChange={(event) => update(row.id, { mitigation: event.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[12px] leading-5 text-slate-800 transition-colors outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            )
          })}
        </div>

        {invalidRows.length ? (
          <div className="px-5 pb-1">
            <Notice tone="warn">
              有 {invalidRows.length} 行缺少风险名称，保存前请补上：{invalidRows
                .map((row) => row.id)
                .join('、')}
            </Notice>
          </div>
        ) : null}

        {localSave.notice}

        <SaveBar
          dirty={dirty}
          onSave={onSave}
          onCancel={onCancel}
          extra={
            <>
              <span className="text-slate-400">保存后会重新加载页面，前台风险页同步更新</span>
              {localSave.statusNode}
            </>
          }
        />
      </Card>

      <div className="mt-4">
        <Notice tone="info">
          后台保存的是<b>完整风险清单</b>；前台风险页只展示按风险分排序的 TOP 5，
          所以在这里新增的风险不一定会出现在前台的 TOP 5 里 —— 分数够高才会进。
        </Notice>
      </div>
    </>
  )
}
