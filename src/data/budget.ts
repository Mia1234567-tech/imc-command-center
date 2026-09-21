// ============================================================
// 【重要声明】
// 本文件中的所有品牌、产品、金额、达人、账号、人名均为虚构，
// 仅用于个人作品集演示，不涉及任何真实企业、客户或业务数据。
// ============================================================

import { campaign } from './campaign'
import type { BudgetDimension } from '../types'
import { load, recordListValidator } from '../store/localStore'

// ------------------------------------------------------------
// 预算数据：10 个预算维度
//
// 两点说明：
//
// 1. 业务口径暂时没有确认，所以维度名称统一用 Dimension 01 ~ Dimension 10，
//    不使用任何推测出来的业务名称。确认口径后只改 name 字段即可。
//
// 2. 这里只维护每个维度的「预算额」和「已使用额」两个原始数字。
//    后台「预算管理」保存后会优先使用统一数据源里的版本（见文件末尾）。
//    总预算、已使用合计、剩余预算、使用率、各维度占比，
//    全部由页面从这 20 个数字里算出来，没有一处是写死的。
//
// 合计口径：
//    预算合计   = 13,380,000（= Campaign 总预算）
//    已使用合计 = 9,944,000（= Campaign 总花费）
// ------------------------------------------------------------

const defaultDimensions: BudgetDimension[] = [
  { key: 'D-01', name: 'Dimension 01', budget: 1_680_000, spent: 2_730_000 },
  { key: 'D-02', name: 'Dimension 02', budget: 1_700_000, spent: 2_190_000 },
  { key: 'D-03', name: 'Dimension 03', budget: 640_000, spent: 1_920_000 },
  { key: 'D-04', name: 'Dimension 04', budget: 2_400_000, spent: 1_040_000 },
  { key: 'D-05', name: 'Dimension 05', budget: 2_400_000, spent: 850_000 },
  { key: 'D-06', name: 'Dimension 06', budget: 2_560_000, spent: 470_000 },
  { key: 'D-07', name: 'Dimension 07', budget: 560_000, spent: 240_000 },
  { key: 'D-08', name: 'Dimension 08', budget: 400_000, spent: 180_000 },
  { key: 'D-09', name: 'Dimension 09', budget: 400_000, spent: 324_000 },
  { key: 'D-10', name: 'Dimension 10', budget: 640_000, spent: 0 },
]

/**
 * 维度数据：优先使用后台保存过的版本。
 * 按 key 合并，而不是整块替换 —— 这样以后代码里新增维度，也不会被旧数据挤掉。
 */
const storedDimensions = load<BudgetDimension[]>(
  'budgetDimensions',
  recordListValidator<BudgetDimension>(['key', 'name', 'budget', 'spent']),
)

export const budgetDimensions: BudgetDimension[] = storedDimensions
  ? defaultDimensions.map((item) => {
      const hit = storedDimensions.find((row) => row.key === item.key)
      if (!hit) return item
      return {
        ...item,
        budget: Number.isFinite(Number(hit.budget)) ? Number(hit.budget) : item.budget,
        spent: Number.isFinite(Number(hit.spent)) ? Number(hit.spent) : item.spent,
      }
    })
  : defaultDimensions

/** 维度口径的预算合计（同时就是 Campaign 总预算的来源） */
export const dimensionBudgetTotal = budgetDimensions.reduce((sum, d) => sum + d.budget, 0)

/** 维度口径的已使用合计 */
export const dimensionSpentTotal = budgetDimensions.reduce((sum, d) => sum + d.spent, 0)

/**
 * 口径对账：预算维度口径 vs 渠道口径。
 * 两者是同一笔钱的两种切法，差额应恒为 0（页面上会把它显示出来自证一致）。
 */
export const budgetReconciliation = {
  dimensionBudget: dimensionBudgetTotal,
  channelBudget: campaign.totalBudget,
  budgetDiff: dimensionBudgetTotal - campaign.totalBudget,
  dimensionSpent: dimensionSpentTotal,
  channelSpent: campaign.totalSpent,
  spentDiff: dimensionSpentTotal - campaign.totalSpent,
}
