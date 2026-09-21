import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, PageHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button, Notice, NumberInput, SaveBar, TextInput } from '../../components/admin/Form'
import { campaign, kpiTargets, totalClicks, totalEngagements, totalImpressions } from '../../data'
import { useSave } from '../../hooks/useSave'
import { achieve, countShort, pct } from '../../utils/format'
import { paceTone } from '../../utils/labels'
import { timeProgress } from '../../utils/metrics'
import type { KpiKey } from '../../types'

// ============================================================
// KPI 管理
//
// 可编辑：名称 / 当前值 / 目标值
// 自动计算：完成率（当前 ÷ 目标）、状态（与时间进度比）
// 不在后台开放：权重（避免改坏加权达成率的算法）
// ============================================================

interface Row {
  key: KpiKey
  name: string
  unit: string
  weight: number
  target: number
  actual: number
}

/** 由渠道数据自动累加出来的「当前值」；A3 / TI / 平台搜索本身是平台后台登记值，没有派生来源 */
const derivedActual: Partial<Record<KpiKey, number>> = {
  impressions: totalImpressions,
  clicksEngagements: totalClicks + totalEngagements,
}

const statusLabel: Record<string, string> = {
  good: '领先时间进度',
  warn: '接近时间进度',
  bad: '落后时间进度',
}

function toRows(): Row[] {
  return kpiTargets.map((item) => ({
    key: item.key,
    name: item.name,
    unit: item.unit,
    weight: item.weight,
    target: item.target,
    actual: item.actual ?? derivedActual[item.key] ?? 0,
  }))
}

export default function AdminKpi() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<Row[]>(toRows)
  const [saved, setSaved] = useState<Row[]>(toRows)
  const localSave = useSave()

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)

  const update = (index: number, patch: Partial<Row>) =>
    setDraft((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)))

  /** 曝光与点击互动的当前值应该等于渠道口径；不一致时给提示 */
  const mismatch = draft.filter((row) => {
    const derived = derivedActual[row.key]
    return derived !== undefined && row.actual !== derived
  })

  const targetMismatch = draft.find((row) => row.key === 'impressions')
  const targetDiffers = targetMismatch ? targetMismatch.target !== campaign.targetImpressions : false

  const onSave = async () => {
    // 保存到本机（localStorage）。失败时不刷新页面，把原因留在页面上。
    const ok = await localSave.push([
      [
        'kpiTargets',
        draft.map((row) => ({
          key: row.key,
          name: row.name,
          target: Math.max(0, Math.round(row.target)),
          actual: Math.max(0, Math.round(row.actual)),
        })),
      ],
    ])

    if (!ok) return
    setSaved(draft.map((row) => ({ ...row })))
    window.location.reload()
  }

  const onCancel = () => setDraft(saved.map((row) => ({ ...row })))

  return (
    <>
      <PageHeader
        zh="KPI 管理"
        en="Admin · KPI"
        desc="5 项核心指标，可以改名称、当前值与目标值；完成率与状态由系统自动计算。保存后 Dashboard、KPI 页、Campaign 总览的目标卡都会同步。"
        extra={
          <div className="flex items-center gap-2">
            <Badge tone="warn">Demo Data · 演示数据</Badge>
            <Button tone="quiet" onClick={() => navigate('/admin')}>
              返回后台首页
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader
          title="指标明细"
          subtitle="完成率 = 当前值 ÷ 目标值；状态按「与时间进度比较」自动判定"
          extra={<Badge tone="idle">权重暂不开放编辑</Badge>}
        />
        <div className="overflow-x-auto">
          <table className="grid-table">
            <thead>
              <tr>
                <th>指标</th>
                <th className="min-w-[130px]">名称</th>
                <th className="num">当前值</th>
                <th className="num">目标值</th>
                <th className="num">完成率（自动）</th>
                <th>状态（自动）</th>
                <th className="num">权重</th>
              </tr>
            </thead>
            <tbody>
              {draft.map((row, index) => {
                const rate = achieve(row.actual, row.target)
                const tone = paceTone(rate, timeProgress)
                const derived = derivedActual[row.key]
                return (
                  <tr key={row.key} data-row={row.key}>
                    <td className="font-medium text-slate-800">
                      {row.name}
                      <span className="ml-1.5 text-[11px] font-normal text-slate-400">
                        {row.unit}
                      </span>
                    </td>
                    <td>
                      <TextInput
                        value={row.name}
                        field="name"
                        cell={false}
                        onChange={(value) => update(index, { name: value })}
                      />
                    </td>
                    <td className="w-[170px]">
                      <NumberInput
                        value={row.actual}
                        min={0}
                        step={10000}
                        cell
                        field="actual"
                        onChange={(value) =>
                          update(index, { actual: value === '' ? 0 : Number(value) })
                        }
                      />
                      {derived !== undefined ? (
                        <div className="mt-1 text-right text-[10.5px] text-slate-400">
                          {row.actual === derived ? '自动累加' : '已覆盖'}
                        </div>
                      ) : null}
                    </td>
                    <td className="w-[170px]">
                      <NumberInput
                        value={row.target}
                        min={0}
                        step={10000}
                        cell
                        field="target"
                        onChange={(value) =>
                          update(index, { target: value === '' ? 0 : Number(value) })
                        }
                      />
                    </td>
                    <td className="tabular num font-semibold text-slate-800">
                      {pct(rate, 2)}
                    </td>
                    <td>
                      <Badge tone={tone}>{statusLabel[tone]}</Badge>
                    </td>
                    <td className="tabular num text-slate-500">{(row.weight * 100).toFixed(0)}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {localSave.notice}
        <SaveBar
          dirty={dirty}
          onSave={onSave}
          onCancel={onCancel}
          extra={localSave.statusNode}
        />
      </Card>

      <div className="mt-4 space-y-3">
        <Notice tone="info">
          <b>「当前值」的两种来源：</b>「总曝光」与「总点击互动」默认由渠道数据自动累加（渠道口径：
          曝光 {countShort(totalImpressions)} 次、点击互动 {countShort(totalClicks + totalEngagements)} 次）；
          「总 A3」「总 TI」「平台搜索」是平台后台登记的累计值。手工改动后会标记为「已覆盖」，改回原值时自动恢复为「自动累加」。
        </Notice>
        {mismatch.length ? (
          <Notice tone="warn">
            <b>口径提醒：</b>
            {mismatch.map((row) => row.name).join('、')} 的当前值与渠道数据自动累加的结果不一致。
            这不会报错，但 Dashboard 的渠道合计会与 KPI 页显示两个数，建议保持一致。
          </Notice>
        ) : null}
        {targetDiffers ? (
          <Notice tone="warn">
            <b>目标一致性：</b>「总曝光」的目标值已改为{' '}
            {countShort(draft.find((row) => row.key === 'impressions')?.target ?? 0)}，
            与三个渠道的目标曝光合计（{countShort(campaign.targetImpressions)}）不一致了。
          </Notice>
        ) : null}
      </div>
    </>
  )
}
