// ============================================================
// 【重要声明】
// 本文件中的所有品牌、产品、金额、达人、账号、人名均为虚构，
// 仅用于个人作品集演示，不涉及任何真实企业、客户或业务数据。
// ============================================================

// ------------------------------------------------------------
// 分析结论文案
//
// 页面上所有「图表的解读文字」「结论段落」「建议清单」都在这里，
// 页面只负责把它们渲染出来。
//
// 三个约定：
// 1. {xxx} 是占位符，页面渲染时会用真实数据填进去，避免文案和表格数字对不上；
// 2. ** ** / !! !! / ++ ++ / %% %% 是强调标记，分别渲染成
//    黑体加粗 / 红色加粗 / 绿色加粗 / 灰色加粗；
// 3. 语气按「执行中段」的正常口径写：整体节奏基本在轨，
//    问题是投入强度略大于产出强度，收尾期以提效率为主，不制造焦虑。
//
// 注意：涉及金额和维度名的地方一律用占位符，
// 预算维度的业务口径还没确认，所以文案里不会出现任何推测出来的业务名称。
// ------------------------------------------------------------

export interface AlertItem {
  level: 'bad' | 'warn' | 'info' | 'good'
  tag: string
  title: string
  desc: string
}

export interface GuideItem {
  tone: 'good' | 'warn' | 'bad'
  title: string
  desc: string
}

export interface PlanItem {
  day: string
  tone: 'bad' | 'warn' | 'info'
  title: string
  detail: string
  /** 这条动作对应的风险编号（可选，用于风险页的「未来 10 天动作」） */
  riskId?: string
  /** 这条动作的负责人（可选） */
  owner?: string
}

export const insights = {
  // ---------------- Dashboard ----------------
  dashboard: {
    trendNote:
      '柱状为每日花费（左轴），折线为当日曝光（右轴）。进入爆发期后花费与曝光同步抬升，曝光曲线的走势基本跟随花费节奏， 没有出现「加量不增量」的明显背离；后续需要关注的是单位花费的曝光产出能不能稳定住。',
    channelCompareNote:
      '抖音与小红书的消耗都接近或超过当期节奏，视频号偏慢；从曝光达成看，抖音（{douyin}）领先，视频号（{shipinhao}）垫底， 顺序与预算投入顺序一致，属于正常的「投入多、先出量」。',
    kpiNote:
      '达成率 95% 以上视为达标。距离 Campaign 结束还有 {days} 天，5 项指标的加权达成率为 **{rate}**，略高于 {time} 的时间进度； 完成率最高的是「{bestName}」（{best}），最低的是「{lowName}」（{low}）。 {slowCount} 项指标按当前日均还需要小幅提速（{slowNames}），其余 {fastCount} 项可以直接覆盖剩余目标。',
    footer:
      '本站为个人作品集演示项目。页面上的品牌、产品、金额、达人、账号与人名均为虚构， 所有数字由程序按同一套模拟规则生成，不接入任何企业系统，也不包含任何真实客户信息。',
    // ---- 顶部核心状态卡（信息减法后的 Dashboard 只有 5 张卡）----
    coreCards: {
      budget: '{count} 个渠道合计，覆盖 {days} 天全周期',
      budgetRateUp: '超前时间进度 {gap}；剩余 {left} 需覆盖 {days} 天',
      budgetRateOk: '与时间进度基本同步；剩余 {left} 需覆盖 {days} 天',
      kpi: '{count} 项核心指标按权重加权，最高「{bestName}」{best}',
      progress: '按阶段天数加权；已执行 {elapsed} / {total} 天，时间进度 {time}',
      risk: '共登记 {total} 项，未关闭 {open} 项（中等 {medium} / 一般 {low}）',
      riskLink: '查看风险清单',
    },
    // ---- 核心 KPI 模块的一句话结论（原来那段长解释已收进 KPI 页面）----
    coreKpiNote:
      '整体与 {time} 的时间进度基本同步；完成率最低的是「{lowName}」（{low}），是收尾期最值得关注的一项。',
    // ---- 当前需要关注：全部由现有计算结果自动生成，最多 {max} 条 ----
    attention: {
      desc: '按现有数据自动生成，只保留最需要处理的问题',
      empty: '各项指标都在正常区间，暂时没有需要立即处理的事项。',
      linkLabel: '查看详情',
      budget: {
        title: '预算执行速度高于时间进度',
        desc: '预算执行率 {rate}，时间进度 {time}，超前 {gap}；剩余 {left} 需覆盖 {days} 天，日均要控制在 {safe} 以内。',
      },
      kpi: {
        title: 'KPI 达成率低于预算投入',
        desc: '加权达成率 {rate}，比预算执行率低 {gap}；按当前日均，{slowNames}在剩余 {days} 天里还需要继续提速。',
        descAllOk: '加权达成率 {rate}，比预算执行率低 {gap}；各项指标按当前日均都能覆盖剩余目标。',
      },
      channel: {
        title: '{name}的综合执行进度滞后',
        desc: '综合进度 {overall}，低于 {time} 的整体时间进度；任务完成度 {task}、内容产出 {content}、预算消耗 {budget}。',
      },
      risk: {
        title: '重点风险 {count} 项未闭环',
        desc: '风险分最高的是「{topTitle}」（{topScore} 分，{topId}），责任人 {topOwner}，处理期限 {topDue}。',
      },
    },
  },

  // ---------------- Campaign 总览 ----------------
  campaign: {
    exposureNote:
      '三个平台的曝光达成率在 {shipinhao} ~ {douyin} 之间：抖音 {douyin}（贡献全站 {douyinShare} 的曝光）、小红书 {xiaohongshu}、视频号 {shipinhao}。 抖音量级最大且达成率最高，是后续加量的首选；视频号受数据回传链路影响，达成率最低，建议先解决归因再谈放量。',
    audienceNote:
      '三个平台的标签均按公开人群资产体系做的演示设定； 小红书的 TI 与抖音的 A3 是本次项目跟踪的人群资产指标，累计进度见「KPI 达成」页面。',
  },

  // ---------------- 项目执行 ----------------
  execution: {
    delayedNote: '延期任务：T-13 视频号直播试播、T-14 达人内容二次混剪投放，均已列入风险清单跟进',
    kolSummaryNote:
      '已发布达人合计花费 {spend}，带来曝光 {impressions} 次、互动 {engagements} 次，平均互动率 ++{rate}++， 明显高于全站平均 {overallRate}；达人内容贡献了全站 {impShare} 的曝光。达人内容是当前效率最高的一块，收尾期值得优先追加。',
    adNote:
      '{count} 个投放账户的 CTR 集中在 {minCtr} ~ {maxCtr} 之间：{bestName} 效率最好（{bestCtr}），但曝光量级偏小； {worstName} 仅 {worstCtr}，曝光占比也最低，数据链路仍在验证阶段。整体 CTR {avgCtr}，与行业 1.5% ~ 2% 的参考区间基本持平。',
    overviewNote:
      '整体呈现「**预算投入快于声量产出**」的结构：预算已消耗 {budgetRate}，而 KPI 加权达成率为 {kpiRate}，内容产出 {contentRate}。 执行侧的重点已经从「把预算花出去」转为「提高单位预算的曝光产出」，收尾期建议把资源投向素材迭代与人群包优化。',
    /** 分渠道进度结论的模板，bestTone 与 worstKolPart 由页面按渠道情况拼好再传进来 */
    channelConclusion:
      '**结论：** {bestName}（{bestRate}）综合进度最高，{bestTone}!!{worstName} 只有 {worstRate}，任务推进（{worstTask}）与预算消耗（{worstBudget}）都排在最后{worstKolPart}!!，在数据链路打通之前不建议继续加预算。',
    channelToneHealthy: '内容交付快于预算消耗，属于健康节奏。',
    channelToneRisky: '预算消耗快于内容交付，需要防止「钱花了、内容没跟上」。',
    /** 无达人合作的渠道在结论里的一句补充说明 */
    channelNoKol: '，该渠道不做达人合作',
    keyIssues:
      '**收尾期需要解决的两件事：**一是预算执行率（{budgetRate}）快于 KPI 加权达成率（{kpiRate}），需要把重心放在素材与人群包的效率优化上； 二是视频号的数据回传口径仍未打通，曝光与互动无法按内容归因，会直接影响收尾期的复盘结论。相关处理方案见「风险分析」页面。',
  },

  // ---------------- 预算 ----------------
  budget: {
    desc:
      '10 个预算维度的分配、使用与占比。核心结论：预算使用率 {rate}，比 {time} 的时间进度快 !!{gap}!!，是目前最需要控制的指标。',
    cumulativeNote:
      '蓝线为实际累计消耗，橙虚线为「按时间均匀推进」的计划线，灰线为每日花费（参考用）。 进入爆发期后实际曲线持续高于计划线，到数据截止日已超出约 !!{gap}!! 的预算进度。',
    distributionNote:
      '预算按维度递减排列，前五个维度合计占 **{top5}**，是本次 Campaign 的投入重点；后五个维度合计只占 {bottom5}。 所有占比都由各维度预算自动计算，改任何一个维度的金额，比例会跟着变。',
    compareNote:
      '使用进度并不均匀：{overName} 已超出维度预算 !!{overAmount}!!，需要优先处理； {lowName} 使用率仅 {lowRate}，预算沉淀比较明显。',
    channelNote:
      '颜色标红表示该渠道的消耗速度高于整体平均水平（{rate}）。',
    overspentNote:
      '**已超出维度预算：**{list}。{unusedName} 的 {unused} 尚未动用，是当前唯一的缓冲空间。',
    disclaimer:
      '**数据口径说明：**「预算维度」与「渠道」是同一笔钱的两种切法 —— 维度口径合计 {budget}（已使用 {spent}）， 渠道口径合计 {channelBudget}（已使用 {channelSpent}），两者差额 {diff}，说明两套口径是对得上的。 渠道口径包含该渠道下官方账号运营、达人合作与投放费用的分摊；维度口径只登记每个维度自身的额度与消耗。 预算与花费为演示用虚构金额，不与曝光等流量数字做除法。 所有数字均为演示用虚构数据。',
  },

  // ---------------- KPI ----------------
  kpi: {
    desc:
      '5 项核心指标的完成情况。核心结论：时间已过 {time}、预算已用 {budget}，KPI 加权达成率为 **{rate}** —— 略快于时间进度、慢于预算投入，收尾期应以提效率为主。',
    /** 曝光这一项按当前日均还需要提速时用这段 */
    gapNoteUp:
      '「剩余差距」= 终期目标 − 本期累计；「剩余日均需求」= 剩余差距 ÷ 剩余 {days} 天。 以曝光为例，前 {elapsed} 天做到日均 {current} 次，剩余 {days} 天需要做到日均 !!{needed}!! 次， 约需提升 {times} 倍 —— 这个差距要靠「素材迭代 + 人群包优化」提效来完成，而不是单纯加预算。',
    /** 曝光这一项按当前日均已经能覆盖剩余目标时用这段 */
    gapNoteOk:
      '「剩余差距」= 终期目标 − 本期累计；「剩余日均需求」= 剩余差距 ÷ 剩余 {days} 天。 以曝光为例，前 {elapsed} 天做到日均 {current} 次，剩余 {days} 天只需保持日均 {needed} 次即可，当前节奏已经有富余。 收尾期的重点是提效，并把资源向还需要提速的 {slowNames} 倾斜。',
    trendNote:
      '曝光与点击互动在爆发期同步抬升，说明放量动作已经生效，且内容效率没有被放量稀释。 后 30 天需要做的是把这套稳定的产出节奏保持到收尾期。',
    channelNote:
      '三个平台的曝光达成率在 {shipinhao} ~ {douyin} 之间：抖音最高（{douyin}），视频号最低（{shipinhao}）。 互动率上视频号反而最高（{shipinhaoRate}），说明私域人群质量不错但触达规模偏小，需要先解决量级问题。',
    caption:
      '统计区间 {start} ~ {end}，共 {days} 天；目标为整个 Campaign（{totalDays} 天）的终期目标。',
    summaryNote:
      '当前 {count} 项指标的加权达成率为 **{rate}** ，略高于时间进度 {timeProgress}，但低于预算进度 {budgetProgress}， 说明预算投入的强度超过了声量与人群资产的积累速度 —— 这是收尾期需要优先解决的问题。',
  },

  // ---------------- 风险 ----------------
  risk: {
    desc: '共登记 {total} 项风险，其中 {open} 项未关闭；页面按风险分（发生概率 × 影响程度）排序，只展示最需要处理的部分。',
    matrixNote:
      '右上角（概率 ≥ 4 且影响 ≥ 4）为需要优先处理的区域，R-01（投入强度大于产出强度）与 R-02（收尾期可能超支）两项落在该区域内并已进入处理中状态。 全站共有 {high} 项重点风险，均需在周会上过一遍应急预案。',
    ruleNote:
      '**判定口径：** 风险分 = 发生概率（1 ~ {inputMax}）× 影响程度（1 ~ {inputMax}），满分 {max} 分。 **{highMin} 分及以上**判为重点风险，**{mediumMin} ~ {mediumMax} 分**判为中等风险，**{lowMax} 分及以下**判为一般风险。 概率或影响一旦调整，等级、优先级排序与矩阵中的位置都会自动重算，不需要手工维护。',
  },
} as const

/** 预算页的「建议动作」清单 */
export const budgetActions: string[] = [
  '暂停 {overName} 的新增支出，超出部分在后续申请中扣减',
  '达人尾款改为按效果分期支付，绑定互动率与曝光产出',
  '收尾期以自然流量与达人二次传播为主，日均花费压到 {safe} 以内',
  '把预算从「继续加投放」转向「素材迭代 + 人群包优化」，先提高单位预算的曝光产出',
]

/** 预算页的「预算预警清单」，{} 里的数字同样由页面按数据填 */
export const budgetAlerts: AlertItem[] = [
  {
    level: 'bad',
    tag: '超支',
    title: '整体预算使用率超前 {gap} 个百分点',
    desc: '按当前日均花费继续执行，预计超支约 {over}，需要在 10 月前完成节奏下调。',
  },
  {
    level: 'bad',
    tag: '超支',
    title: '{overName} 已超出预算 {overAmount}',
    desc: '超出部分主要来自临时增加的成本，后续需要提前锁定单价，并给该维度设置额度硬上限。',
  },
  {
    level: 'warn',
    tag: '效率',
    title: '预算消耗快于 KPI 达成',
    desc: '预算已执行 {budgetRate}，而 KPI 加权达成率 {kpiRate}，单位预算的曝光产出偏低，需要先做素材与出价复盘。',
  },
  {
    level: 'info',
    tag: '结构',
    title: '{lowName} 使用率仅 {lowRate}',
    desc: '预算沉淀比较明显，可考虑把部分额度转移到曝光产出更稳定的维度。',
  },
  {
    level: 'good',
    tag: '缓冲',
    title: '{unusedName} 的 {unused} 尚未动用',
    desc: '是当前唯一的预算缓冲来源，建议保留到投流结构复盘完成后再分配。',
  },
]

/** KPI 页的「达成率解读」规则 */
export const kpiLevelGuide: GuideItem[] = [
  {
    tone: 'good',
    title: '领先时间进度 · 健康',
    desc: '完成率高于同期时间进度，按当前节奏可以在 Campaign 结束时完成甚至超额。',
  },
  {
    tone: 'warn',
    title: '略慢于时间进度 · 需关注',
    desc: '差距通常在 5 个百分点以内，靠优化投放结构或增加内容供给即可补上，不需要额外加预算。',
  },
  {
    tone: 'bad',
    title: '明显落后 · 需干预',
    desc: '落后时间进度 5 个百分点以上，需要补充动作或调整资源分配，否则终期无法达成。',
  },
]

/** 风险页的「未来 10 天应对节奏」 */
export const riskResponsePlan: PlanItem[] = [
  {
    day: '9/21 - 9/23',
    tone: 'warn',
    riskId: 'R-02',
    owner: '李××',
    title: '投流结构复盘与节奏控制',
    detail: '逐账户复盘素材 CTR 与曝光产出；对低效账户设置日预算硬上限；暂停 Dimension 03 的新增支出。',
  },
  {
    day: '9/24 - 9/26',
    tone: 'warn',
    riskId: 'R-08',
    owner: '王××',
    title: '人群资产补量',
    detail: '优化小红书 TI 人群包标签组合、扩大抖音 A3 定向；同步测试搜索场景的关键词包与品牌词卡位。',
  },
  {
    day: '9/27 - 9/28',
    tone: 'info',
    riskId: 'R-04',
    owner: '赵××',
    title: '内容与达人排期收口',
    detail: '与 3 位延期达人签订补充确认单；提高品牌号内容供给频次；确认 10 月头部直播 2 场档期。',
  },
  {
    day: '9/29 - 9/30',
    tone: 'info',
    riskId: 'R-01',
    owner: '李××',
    title: '爆发期复盘与收尾期排期',
    detail: '输出爆发期效果复盘，明确收尾期的资源分配与内容排期，把目标口径对齐到同一套数据看板。',
  },
]
