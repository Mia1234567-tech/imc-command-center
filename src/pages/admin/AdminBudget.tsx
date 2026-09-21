import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, PageHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button, Notice, NumberInput, SaveBar } from '../../components/admin/Form'
import { budgetDimensions, campaign } from '../../data'
import { useSave } from '../../hooks/useSave'
import { money, moneyShort, pct, signedMoney } from '../../utils/format'
import type { BudgetDimension } from '../../types'

// ============================================================
// 预算管理
//
// 只能改两个数：每个维度的「预算」与「已使用」。
// 剩余、使用率、以及所有合计都由页面实时算出来 —— 一个都不手填。
// ============================================================

interface Row {
  key: string
  name: string
  budget: number
  spent: number
}

const clone = (rows: BudgetDimension[]): Row[] => rows.map((row) => ({ ...row }))

export default function AdminBudget() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<Row[]>(() => clone(budgetDimensions))
  const [saved, setSaved] = useState<Row[]>(() => clone(budgetDimensions))
  const localSave = useSave()

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)

  const setValue = (index: number, key: 'budget' | 'spent', raw: string) => {
    const value = raw === '' ? 0 : Math.max(0, Math.round(Number(raw)))
    setDraft((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: Number.isFinite(value) ? value : 0 } : row)),
    )
  }

  // —— 全部由 draft 实时计算，没有任何手填的结果 ——
  const totalBudget = draft.reduce((sum, row) => sum + row.budget, 0)
  const totalSpent = draft.reduce((sum, row) => sum + row.spent, 0)
  const totalLeft = totalBudget - totalSpent
  const totalRate = totalBudget ? totalSpent / totalBudget : 0

  const channelDiff = totalBudget - campaign.totalBudget
  const spentDiff = totalSpent - campaign.totalSpent

  const onSave = async () => {
    // 保存到本机（localStorage）。失败时不刷新页面，把原因留在页面上。
    if (!(await localSave.push([['budgetDimensions', draft]]))) return
    setSaved(clone(draft))
    window.location.reload()
  }

  const onCancel = () => setDraft(clone(saved))

  return (
    <>
      <PageHeader
        zh="预算管理"
        en="Admin · Budget"
        desc="10 个预算维度，只维护「预算」与「已使用」两个数字；剩余、使用率与四个合计都是实时算出来的。保存后前台预算页会读取新数据。"
        extra={
          <div className="flex items-center gap-2">
            <Badge tone="warn">Demo Data · 演示数据</Badge>
            <Button tone="quiet" onClick={() => navigate('/admin')}>
              返回后台首页
            </Button>
          </div>
        }
      />

      {/* 合计（全部自动计算） */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card card-pad card-hover fade-up">
          <div className="text-[11.5px] font-medium text-slate-500">总预算</div>
          <div className="tabular mt-3 text-[24px] leading-none font-semibold tracking-[-0.02em] text-slate-900">
            {moneyShort(totalBudget)}
          </div>
          <div className="mt-3 text-[11px] text-slate-400">
            {draft.length} 个维度的自动加总
          </div>
        </div>
        <div className="card card-pad card-hover fade-up">
          <div className="text-[11.5px] font-medium text-slate-500">总已使用</div>
          <div className="tabular mt-3 text-[24px] leading-none font-semibold tracking-[-0.02em] text-slate-900">
            {moneyShort(totalSpent)}
          </div>
          <div className="mt-3 text-[11px] text-slate-400">各维度已使用的自动加总</div>
        </div>
        <div className="card card-pad card-hover fade-up">
          <div className="text-[11.5px] font-medium text-slate-500">总剩余</div>
          <div
            className={`tabular mt-3 text-[24px] leading-none font-semibold tracking-[-0.02em] ${totalLeft < 0 ? 'text-rose-600' : 'text-slate-900'}`}
          >
            {totalLeft < 0 ? signedMoney(totalLeft) : moneyShort(totalLeft)}
          </div>
          <div className="mt-3 text-[11px] text-slate-400">总预算 − 总已使用</div>
        </div>
        <div className="card card-pad card-hover fade-up">
          <div className="text-[11.5px] font-medium text-slate-500">总使用率</div>
          <div className="tabular mt-3 text-[24px] leading-none font-semibold tracking-[-0.02em] text-slate-900">
            {pct(totalRate)}
          </div>
          <div className="mt-3 text-[11px] text-slate-400">总已使用 ÷ 总预算</div>
        </div>
      </div>

      <Card className="mt-4">
        <CardHeader
          title="维度明细"
          subtitle="直接修改「预算」与「已使用」，其余列自动更新"
          extra={<Badge tone="idle">{draft.length} 个维度</Badge>}
        />
        <div className="overflow-x-auto">
          <table className="grid-table">
            <thead>
              <tr>
                <th>维度</th>
                <th className="num">预算</th>
                <th className="num">已使用</th>
                <th className="num">剩余（自动）</th>
                <th className="num">使用率（自动）</th>
              </tr>
            </thead>
            <tbody>
              {draft.map((row, index) => {
                const left = row.budget - row.spent
                const rate = row.budget ? row.spent / row.budget : 0
                return (
                  <tr key={row.key} data-row={row.key}>
                    <td className="font-medium text-slate-800">{row.name}</td>
                    <td className="w-[190px]">
                      <NumberInput
                        value={row.budget}
                        min={0}
                        step={10000}
                        cell
                        field="budget"
                        onChange={(value) => setValue(index, 'budget', value)}
                      />
                    </td>
                    <td className="w-[190px]">
                      <NumberInput
                        value={row.spent}
                        min={0}
                        step={10000}
                        cell
                        field="spent"
                        onChange={(value) => setValue(index, 'spent', value)}
                      />
                    </td>
                    <td
                      className={`tabular num font-medium ${left < 0 ? 'text-rose-600' : 'text-slate-600'}`}
                    >
                      {left < 0 ? signedMoney(left) : money(left)}
                    </td>
                    <td
                      className={`tabular num font-medium ${rate > 1 ? 'text-rose-600' : rate > 0.8 ? 'text-amber-600' : 'text-slate-600'}`}
                    >
                      {pct(rate)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50/70">
                <td className="text-[12px] font-semibold text-slate-700">合计</td>
                <td className="tabular num text-[12px] font-semibold text-slate-900">
                  {money(totalBudget)}
                </td>
                <td className="tabular num text-[12px] font-semibold text-slate-900">
                  {money(totalSpent)}
                </td>
                <td className="tabular num text-[12px] font-semibold text-slate-900">
                  {money(totalLeft)}
                </td>
                <td className="tabular num text-[12px] font-semibold text-slate-900">
                  {pct(totalRate)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* 口径对账：维度合计 vs 渠道合计 */}
      <div className="mt-4">
        {channelDiff === 0 && spentDiff === 0 ? (
          <Notice tone="good">
            口径对账：维度合计与渠道合计一致（差额 ¥0）。前台预算页也会显示这个差额，用来证明两套切法是同一笔钱。
          </Notice>
        ) : (
          <Notice tone="warn">
            口径对账：维度合计与渠道合计不一致 —— 预算差额 <b>{signedMoney(channelDiff)}</b>、已使用差额{' '}
            <b>{signedMoney(spentDiff)}</b>。前台预算页会把这个差额显示出来（渠道口径 ={' '}
            {money(campaign.totalBudget)} / {money(campaign.totalSpent)}）。这是正常的：本页只改维度口径，
            渠道口径要等下一版开放的「渠道数据」模块才能一起改。
          </Notice>
        )}
      </div>

      <Card className="mt-4">
        {localSave.notice}
        <SaveBar
          dirty={dirty}
          onSave={onSave}
          onCancel={onCancel}
          extra={localSave.statusNode}
        />
      </Card>
    </>
  )
}
