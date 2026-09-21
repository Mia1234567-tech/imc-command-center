import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody, CardHeader, PageHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button, DateInput, Field, Notice, SaveBar, Select, TextInput } from '../../components/admin/Form'
import { campaign, channels, phases } from '../../data'
import { useSave } from '../../hooks/useSave'
import { countShort, moneyShort } from '../../utils/format'
import type { Phase } from '../../types'

// ============================================================
// Campaign 管理
//
// 可编辑：名称 / ID / 开始日期 / 数据截止日 / 结束日期 / 状态 / 当前阶段 / 目标 / 负责人 / 团队
// 只读：总预算、总花费、各项目标值 —— 它们由三个渠道的数据自动汇总，改这里没意义
// ============================================================

const STATUS_WORDS = ['未开始', '执行中', '已暂停', '已结束']

/** '执行中 · 爆发期' → ['执行中', '爆发期'] */
function splitStatus(status: string): [string, string] {
  const [word, phase] = status.split(' · ')
  return [STATUS_WORDS.includes(word) ? word : STATUS_WORDS[1], phase ?? '']
}

/** 切换当前阶段：之前的阶段标记为已结束，选中为进行中，之后为未开始 */
function withActivePhase(list: Phase[], key: string): Phase[] {
  const index = list.findIndex((phase) => phase.key === key)
  return list.map((phase, i) => ({
    ...phase,
    status: i < index ? 'done' : i === index ? 'active' : 'todo',
  }))
}

interface Draft {
  name: string
  code: string
  owner: string
  team: string
  startDate: string
  dataCutoff: string
  endDate: string
  statusWord: string
  phaseKey: string
  objective: string
}

function toDraft(): Draft {
  const [statusWord, phaseName] = splitStatus(campaign.status)
  const hit = phases.find((phase) => phase.name === phaseName)
  return {
    name: campaign.name,
    code: campaign.code,
    owner: campaign.owner,
    team: campaign.team,
    startDate: campaign.startDate,
    dataCutoff: campaign.dataCutoff,
    endDate: campaign.endDate,
    statusWord,
    phaseKey: hit?.key ?? phases.find((phase) => phase.status === 'active')?.key ?? 'burst',
    objective: campaign.objective,
  }
}

export default function AdminCampaign() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<Draft>(toDraft)
  const [saved, setSaved] = useState<Draft>(toDraft)
  const localSave = useSave()

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
  const dateOrderOk =
    draft.startDate <= draft.dataCutoff && draft.dataCutoff <= draft.endDate

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }))

  const onSave = async () => {
    if (!dateOrderOk) return
    const phase = phases.find((item) => item.key === draft.phaseKey)
    // 保存到本机（localStorage）。失败时不刷新页面，把原因留在页面上。
    // 一次请求写入两个数据桶：Campaign 信息 + 执行阶段（当前阶段）
    const ok = await localSave.push([
      [
        'campaign',
        {
          name: draft.name,
          code: draft.code,
          owner: draft.owner,
          team: draft.team,
          startDate: draft.startDate,
          dataCutoff: draft.dataCutoff,
          endDate: draft.endDate,
          status: phase ? `${draft.statusWord} · ${phase.name}` : draft.statusWord,
          objective: draft.objective,
          // brand / product / description 不在后台开放，保持默认值
          brand: campaign.brand,
          product: campaign.product,
          description: campaign.description,
        },
      ],
      ['phases', withActivePhase(phases, draft.phaseKey)],
    ])

    if (!ok) return
    setSaved(draft)
    window.location.reload()
  }

  const onCancel = () => setDraft(saved)

  return (
    <>
      <PageHeader
        zh="Campaign 管理"
        en="Admin · Campaign"
        desc="编辑 Campaign 的基本信息与当前阶段。保存后 Dashboard、Campaign 总览、KPI 与预算页的时间口径都会跟着变。"
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
        <CardHeader title="基本信息" subtitle="带下划线的字段可以直接修改" />
        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Campaign 名称" width="lg">
              <TextInput
                value={draft.name}
                field="name"
                onChange={(value) => update('name', value)}
              />
            </Field>
            <Field label="Campaign ID" hint="内部编号，用于区分不同项目">
              <TextInput
                value={draft.code}
                field="code"
                onChange={(value) => update('code', value)}
              />
            </Field>

            <Field label="开始日期">
              <DateInput
                value={draft.startDate}
                field="startDate"
                onChange={(value) => update('startDate', value)}
              />
            </Field>
            <Field label="结束日期">
              <DateInput
                value={draft.endDate}
                field="endDate"
                onChange={(value) => update('endDate', value)}
              />
            </Field>

            <Field
              label="数据截止日"
              hint="决定「已执行天数 / 时间进度」的口径，必须落在开始与结束之间"
            >
              <DateInput
                value={draft.dataCutoff}
                field="dataCutoff"
                onChange={(value) => update('dataCutoff', value)}
              />
            </Field>
            <Field label="Campaign 状态">
              <Select
                value={draft.statusWord}
                field="statusWord"
                onChange={(value) => update('statusWord', value)}
                options={STATUS_WORDS.map((word) => ({ value: word, label: word }))}
              />
            </Field>

            <Field
              label="当前阶段"
              hint="切换后 Dashboard 的阶段进度卡会同步；前序阶段标记为已结束"
            >
              <Select
                value={draft.phaseKey}
                field="phaseKey"
                onChange={(value) => update('phaseKey', value)}
                options={phases.map((phase) => ({ value: phase.key, label: phase.name }))}
              />
            </Field>
            <Field label="项目负责人">
              <TextInput
                value={draft.owner}
                field="owner"
                onChange={(value) => update('owner', value)}
              />
            </Field>

            <Field label="项目团队">
              <TextInput
                value={draft.team}
                field="team"
                onChange={(value) => update('team', value)}
              />
            </Field>

            <Field label="Campaign 目标" width="lg">
              <textarea
                value={draft.objective}
                data-field="objective"
                rows={3}
                onChange={(event) => update('objective', event.target.value)}
                className="w-full rounded-[10px] border border-slate-200 bg-white px-2.5 py-2 text-[12.5px] leading-5 text-slate-800 transition-colors outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </Field>
          </div>

          {!dateOrderOk ? (
            <div className="mt-4">
              <Notice tone="warn">
                日期顺序不对：需要满足「开始日期 ≤ 数据截止日 ≤ 结束日期」，否则时间进度会算错。
                当前：{draft.startDate} / {draft.dataCutoff} / {draft.endDate}
              </Notice>
            </div>
          ) : null}
        </CardBody>
        {localSave.notice}
        <SaveBar
          dirty={dirty}
          onSave={onSave}
          onCancel={onCancel}
          extra={localSave.statusNode}
        />
      </Card>

      <Card className="mt-4">
        <CardHeader
          title="自动汇总的总量（只读）"
          subtitle="这些数字由三个渠道的明细自动加总，后台不提供直接编辑"
          extra={<Badge tone="idle">{channels.length} 个渠道</Badge>}
        />
        <CardBody>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3">
              <div className="text-[11px] text-slate-500">总预算</div>
              <div className="tabular mt-1.5 text-[16px] leading-none font-semibold text-slate-900">
                {moneyShort(campaign.totalBudget)}
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3">
              <div className="text-[11px] text-slate-500">总花费</div>
              <div className="tabular mt-1.5 text-[16px] leading-none font-semibold text-slate-900">
                {moneyShort(campaign.totalSpent)}
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3">
              <div className="text-[11px] text-slate-500">目标曝光</div>
              <div className="tabular mt-1.5 text-[16px] leading-none font-semibold text-slate-900">
                {countShort(campaign.targetImpressions)}
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3">
              <div className="text-[11px] text-slate-500">目标内容量</div>
              <div className="tabular mt-1.5 text-[16px] leading-none font-semibold text-slate-900">
                {campaign.targetContent} 条
              </div>
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-5 text-slate-400">
            想改这些数字，需要改渠道口径的明细（本版本后台暂未开放渠道编辑，计划放在下一版）。
          </p>
        </CardBody>
      </Card>
    </>
  )
}
