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
import { tasks } from '../../data'
import { useSave } from '../../hooks/useSave'
import { channelNames, phaseNames, priorityMeta, taskStatusMeta } from '../../utils/labels'
import type { PhaseKey, TaskItem, TaskStatus } from '../../types'

// ============================================================
// 项目执行管理（任务）
//
// 支持新增 / 编辑 / 删除。保存后前台「项目执行」页的任务表、
// 分渠道执行进度、综合执行度都会用新数据重算。
// ============================================================

const PHASE_OPTIONS = (Object.keys(phaseNames) as PhaseKey[]).map((key) => ({
  value: key,
  label: phaseNames[key],
}))

const CHANNEL_OPTIONS = [
  { value: 'xiaohongshu', label: channelNames.xiaohongshu },
  { value: 'douyin', label: channelNames.douyin },
  { value: 'shipinhao', label: channelNames.shipinhao },
  { value: 'cross', label: '跨渠道' },
]

const STATUS_OPTIONS = (Object.keys(taskStatusMeta) as TaskStatus[]).map((key) => ({
  value: key,
  label: taskStatusMeta[key].label,
}))

const PRIORITY_OPTIONS = (['high', 'medium', 'low'] as const).map((key) => ({
  value: key,
  label: priorityMeta[key].label,
}))

const PROGRESS_OPTIONS = [0, 25, 50, 75, 100].map((value) => ({
  value: String(value),
  label: `${value}%`,
}))

const clone = (rows: TaskItem[]): TaskItem[] => rows.map((row) => ({ ...row }))

/** 生成下一个任务编号：T-16 / T-17 … */
function nextTaskId(rows: TaskItem[]): string {
  const max = rows.reduce((acc, row) => {
    const matched = /^T-(\d+)$/.exec(row.id)
    return matched ? Math.max(acc, Number(matched[1])) : acc
  }, 0)
  return `T-${String(max + 1).padStart(2, '0')}`
}

export default function AdminExecution() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<TaskItem[]>(() => clone(tasks))
  const [saved, setSaved] = useState<TaskItem[]>(() => clone(tasks))
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const localSave = useSave()

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)

  const update = (id: string, patch: Partial<TaskItem>) =>
    setDraft((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))

  const onAdd = () => {
    const id = nextTaskId(draft)
    setDraft((prev) => [
      ...prev,
      {
        id,
        name: '新任务（请在名称里写清要做什么）',
        channel: 'cross',
        phase: 'burst',
        owner: '待指派',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        progress: 0,
        status: 'todo',
        priority: 'medium',
      },
    ])
  }

  const invalidRows = draft.filter(
    (row) => !row.name.trim() || row.endDate < row.startDate,
  )

  const onSave = async () => {
    if (invalidRows.length) return
    // 保存到本机（localStorage）。失败时不刷新页面，把原因留在页面上。
    if (!(await localSave.push([['tasks', draft]]))) return
    setSaved(clone(draft))
    window.location.reload()
  }

  const onCancel = () => {
    setDraft(clone(saved))
    setPendingDelete(null)
  }

  return (
    <>
      <PageHeader
        zh="项目执行管理"
        en="Admin · Execution"
        desc="任务的增删改。保存后前台「项目执行」页的任务表、分渠道执行进度与综合执行度会按新数据重算。"
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
          title="任务清单"
          subtitle={`共 ${draft.length} 项 · 完成率可选 0 / 25 / 50 / 75 / 100，状态可选未开始 / 进行中 / 已完成 / 延期`}
          extra={
            <Button tone="ghost" onClick={onAdd} field="add-row">
              <Plus size={13} />
              新增任务
            </Button>
          }
        />
        <div className="overflow-x-auto">
          <table className="grid-table">
            <thead>
              <tr>
                <th>任务ID</th>
                <th className="min-w-[176px]">任务名称</th>
                <th>阶段</th>
                <th>渠道</th>
                <th>负责人</th>
                <th>计划开始</th>
                <th>计划结束</th>
                <th>完成率</th>
                <th>状态</th>
                <th>优先级</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {draft.map((row) => (
                <tr key={row.id} data-row={row.id}>
                  <td className="tabular text-[11px] text-slate-400">{row.id}</td>
                  <td>
                    <TextInput
                      value={row.name}
                      field="name"
                      cell
                      onChange={(value) => update(row.id, { name: value })}
                    />
                  </td>
                  <td className="w-[92px]">
                    <Select
                      value={row.phase}
                      field="phase"
                      cell
                      options={PHASE_OPTIONS}
                      onChange={(value) => update(row.id, { phase: value as PhaseKey })}
                    />
                  </td>
                  <td className="w-[104px]">
                    <Select
                      value={row.channel}
                      field="channel"
                      cell
                      options={CHANNEL_OPTIONS}
                      onChange={(value) => update(row.id, { channel: value as TaskItem['channel'] })}
                    />
                  </td>
                  <td className="w-[96px]">
                    <TextInput
                      value={row.owner}
                      field="owner"
                      cell
                      onChange={(value) => update(row.id, { owner: value })}
                    />
                  </td>
                  <td className="w-[132px]">
                    <DateInput
                      value={row.startDate}
                      field="startDate"
                      cell
                      onChange={(value) => update(row.id, { startDate: value })}
                    />
                  </td>
                  <td className="w-[132px]">
                    <DateInput
                      value={row.endDate}
                      field="endDate"
                      cell
                      onChange={(value) => update(row.id, { endDate: value })}
                    />
                  </td>
                  <td className="w-[92px]">
                    <Select
                      value={String(row.progress)}
                      field="progress"
                      cell
                      options={PROGRESS_OPTIONS}
                      onChange={(value) => update(row.id, { progress: Number(value) })}
                    />
                  </td>
                  <td className="w-[104px]">
                    <Select
                      value={row.status}
                      field="status"
                      cell
                      options={STATUS_OPTIONS}
                      onChange={(value) => update(row.id, { status: value as TaskStatus })}
                    />
                  </td>
                  <td className="w-[88px]">
                    <Select
                      value={row.priority}
                      field="priority"
                      cell
                      options={PRIORITY_OPTIONS}
                      onChange={(value) => update(row.id, { priority: value as TaskItem['priority'] })}
                    />
                  </td>
                  <td className="w-[92px]">
                    {pendingDelete === row.id ? (
                      <div className="flex items-center gap-1.5">
                        <Button
                          tone="danger"
                          field="delete-confirm"
                          onClick={() => {
                            setDraft((prev) => prev.filter((item) => item.id !== row.id))
                            setPendingDelete(null)
                          }}
                        >
                          确认
                        </Button>
                        <Button tone="quiet" onClick={() => setPendingDelete(null)}>
                          取消
                        </Button>
                      </div>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {invalidRows.length ? (
          <div className="px-5 pt-3">
            <Notice tone="warn">
              有 {invalidRows.length} 行需要修正：任务名称不能为空，且「计划结束」不能早于「计划开始」。
              涉及：{invalidRows.map((row) => row.id).join('、')}
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
              <span className="text-slate-400">保存后会重新加载页面，确保全站数字一致</span>
              {localSave.statusNode}
            </>
          }
        />
      </Card>

      <div className="mt-4">
        <Notice tone="info">
          本页只管理<b>任务</b>。达人项目（8 位）与投流账户（6 个）的明细这一版暂不开放编辑，
          需要的话放在下一版一起做。
        </Notice>
      </div>
    </>
  )
}
