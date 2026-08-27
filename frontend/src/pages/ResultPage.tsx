import { useState, type ReactNode } from 'react'
import { Brain, CalendarDays, Frown, Gauge, RefreshCw, ShieldCheck, Smile, Sparkles } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { GlassButton, GlassCard, MetricDisplay } from '../components'
import type { FinalReport, HeatmapCell, LanguagePersonReport } from '../types'

type ResultPageProps = {
  report: FinalReport | null
  onReset: () => void
}

type HeatmapRange = 'day' | 'week' | 'month' | 'year'
type SmartInsightKey = 'dominance' | 'mood' | 'loveBrain' | 'showOff' | 'trust' | 'iq'
type HeatmapTick = { label: string; column: number }
type HeatmapYTick = { label: string; row: number }

const heatmapRanges: Array<{ key: HeatmapRange; label: string }> = [
  { key: 'day', label: '一天' },
  { key: 'week', label: '一周' },
  { key: 'month', label: '一月' },
  { key: 'year', label: '一年' },
]

const smartOptions: Array<{ key: SmartInsightKey; label: string }> = [
  { key: 'dominance', label: '攻/受分析' },
  { key: 'mood', label: '心情分析' },
  { key: 'loveBrain', label: '恋爱脑' },
  { key: 'showOff', label: '嘉豪程度' },
  { key: 'trust', label: '可信任程度' },
  { key: 'iq', label: '智商' },
]

const COPY = {
  eyebrow: '\u5206\u6790\u7ed3\u679c',
  emptyTitle: '\u8fd8\u6ca1\u6709\u62a5\u544a',
  emptyCopy: '\u4e0a\u4f20\u5e76\u5206\u6790\u4e00\u4efd\u804a\u5929\u8bb0\u5f55\u540e\uff0c\u8fd9\u91cc\u4f1a\u51fa\u73b0\u5b8c\u6574\u7684\u5173\u7cfb\u5207\u7247\u3002',
  uploadAgain: '\u91cd\u65b0\u4e0a\u4f20',
  intimacy: '\u4eb2\u5bc6\u503c',
  dependence: '\u4f9d\u8d56\u6307\u6570',
  tacit: '\u9ed8\u5951\u7a0b\u5ea6',
  emotion: '\u60c5\u7eea\u6ce2\u52a8',
  dependenceChart: '\u4f9d\u8d56\u5ea6\u5bf9\u6bd4',
  personality: '\u6027\u683c\u5149\u8c31',
  mbti: 'MBTI 判断',
  heatmap: '聊天频率热力图',
  heatmapHint: '选择一天、一周、一月或一年查看聊天密度',
  heatmapEmpty: '这份历史报告还没有热力图数据，重新上传分析后会自动生成。',
  mbtiResult: 'MBTI 结果',
  smartTitle: '智能分析',
  smartHint: '勾选需要看的维度后再生成，结果页不会默认耗时计算全部内容。',
  smartRun: '生成所选分析',
  smartEmpty: '先选择一个或多个维度。',
  suggestions: '\u8da3\u5473\u5efa\u8bae',
  summary: '\u5173\u7cfb\u6458\u8981',
  stableTag: '\u7a33\u5b9a\u966a\u4f34\u578b',
  defaultRelation: '\u5173\u7cfb\u89c2\u5bdf\u4e2d',
  defaultSummary: '\u4f60\u4eec\u7684\u4e92\u52a8\u6b63\u5728\u88ab\u6574\u7406\u6210\u66f4\u6e05\u6670\u7684\u5173\u7cfb\u5207\u7247\u3002',
  defaultSuggestion: '\u4fdd\u6301\u7a33\u5b9a\u56de\u5e94\uff0c\u628a\u91cd\u8981\u611f\u53d7\u8bf4\u6e05\u695a\u3002',
  personA: '\u4f60',
  personB: '\u5bf9\u65b9',
}

const chartTooltipStyle = {
  border: '1px solid rgba(255, 255, 255, 0.48)',
  borderRadius: 16,
  background: 'rgba(255, 255, 255, 0.78)',
  boxShadow: '0 16px 42px rgba(37, 47, 70, 0.14)',
  color: '#151b26',
}

function ResultPage({ report, onReset }: ResultPageProps) {
  const [heatmapRange, setHeatmapRange] = useState<HeatmapRange>('month')
  const [selectedSmartKeys, setSelectedSmartKeys] = useState<SmartInsightKey[]>(['dominance', 'mood'])
  const [hasRunSmartAnalysis, setHasRunSmartAnalysis] = useState(false)

  if (!report) {
    return (
      <section className="w-full">
        <GlassCard className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#4f8cff] dark:text-[#8fc2ff]">{COPY.eyebrow}</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{COPY.emptyTitle}</h1>
              <p className="mt-3 max-w-xl text-base leading-7 text-[rgb(var(--text-secondary))]">{COPY.emptyCopy}</p>
            </div>
            <GlassButton className="inline-flex min-h-11 items-center justify-center gap-2 px-5 py-3 text-sm font-semibold" onClick={onReset}>
              <RefreshCw size={16} strokeWidth={1.8} />
              {COPY.uploadAgain}
            </GlassButton>
          </div>
        </GlassCard>
      </section>
    )
  }

  const allReports = report.all_reports ?? {}
  const relationReport = allReports.relation_report ?? {}
  const emotionReport = allReports.emotion_report ?? {}
  const interactionReport = allReports.interaction_report ?? {}
  const languageReport = allReports.language_report ?? {}
  const intimacyScore = clamp(report.intimacy_score ?? 0, 0, 100)
  const relationshipType = relationReport.relationship_type ?? COPY.defaultRelation
  const funTags = report.fun_tags?.length ? report.fun_tags : [COPY.stableTag]
  const suggestions = relationReport.suggestions?.length ? relationReport.suggestions : [COPY.defaultSuggestion]
  const personA = languageReport.person_a?.name || COPY.personA
  const personB = languageReport.person_b?.name || COPY.personB

  const metrics = [
    { label: COPY.intimacy, value: intimacyScore, suffix: '/100', hint: ratioText(emotionReport.positive_ratio) },
    {
      label: COPY.dependence,
      value: percent(average([interactionReport.dependence_score?.person_a, interactionReport.dependence_score?.person_b])),
      suffix: '%',
      hint: ratioText(interactionReport.initiation_ratio?.person_a),
    },
    { label: COPY.tacit, value: percent(interactionReport.tacit_score), suffix: '%', hint: delayText(interactionReport.avg_reply_delay) },
  ]

  const intimacyData = [{ name: COPY.intimacy, value: intimacyScore, fill: '#4f8cff' }]
  const emotionCurve = buildEmotionCurve(emotionReport.emotion_curve)
  const dependenceData = [
    { name: personA, value: percent(interactionReport.dependence_score?.person_a), fill: '#4f8cff' },
    { name: personB, value: percent(interactionReport.dependence_score?.person_b), fill: '#53d6b5' },
  ]
  const radarData = buildRadarData(languageReport.person_a, languageReport.person_b)
  const heatmapView = buildHeatmapView(report, heatmapRange)
  const heatmapCells = heatmapView.cells
  const maxHeatmapCount = Math.max(1, ...heatmapCells.map((cell) => cell.count))
  const smartInsights = buildSmartInsights({
    personA,
    personB,
    languagePersonA: languageReport.person_a,
    languagePersonB: languageReport.person_b,
    emotionReport,
    interactionReport,
    intimacyScore,
  })

  return (
    <section className="w-full space-y-5">
      <GlassCard className="p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#4f8cff] dark:text-[#8fc2ff]">{COPY.eyebrow}</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{relationshipType}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {funTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/50 bg-white/[0.35] px-4 py-2 text-sm font-medium text-[rgb(var(--text-secondary))] shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.08]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <MetricDisplay key={metric.label} {...metric} />
        ))}
      </div>

      <GlassCard className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[16px] bg-white/55 text-[#6e6e73] shadow-soft dark:bg-white/10">
              <CalendarDays size={18} strokeWidth={1.8} />
            </span>
            <div>
              <ChartTitle title={COPY.heatmap} />
              <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">{COPY.heatmapHint}</p>
            </div>
          </div>
          <span className="rounded-full bg-white/[0.42] px-3 py-1 text-xs font-semibold text-[rgb(var(--text-muted))] shadow-soft dark:bg-white/[0.08]">
            {heatmapCells.reduce((sum, cell) => sum + cell.count, 0)} messages
          </span>
        </div>
        <div className="heatmap-range-shell mt-5">
          {heatmapRanges.map((range) => (
            <button
              key={range.key}
              type="button"
              className={heatmapRange === range.key ? 'heatmap-range-button heatmap-range-button-active' : 'heatmap-range-button'}
              onClick={() => setHeatmapRange(range.key)}
            >
              {range.label}
            </button>
          ))}
        </div>
        {report.chat_heatmap?.length || report.chat_hourly_heatmap?.length ? (
          <div className="mt-5 overflow-x-auto pb-1">
            <div className="activity-heatmap-wrap">
              <div className="heatmap-y-axis" style={{ gridTemplateRows: `repeat(${heatmapView.rows}, 12px)` }}>
                {heatmapView.yLabels.map((tick) => (
                  <span key={`${tick.label}-${tick.row}`} style={{ gridRow: tick.row + 1 }}>
                    {tick.label}
                  </span>
                ))}
              </div>
              <div>
                <div
                  className="activity-heatmap-grid"
                  style={{
                    gridTemplateRows: `repeat(${heatmapView.rows}, 12px)`,
                    gridAutoColumns: '12px',
                  }}
                >
              {heatmapCells.map((cell) => (
                <span
                  key={cell.date}
                  className="heatmap-cell"
                  title={`${cell.date}: ${cell.count} messages`}
                  style={{ opacity: cell.count ? 0.32 + (cell.count / maxHeatmapCount) * 0.68 : 0.16 }}
                />
              ))}
                </div>
                <div className="heatmap-x-axis" style={{ width: `${heatmapView.axisWidth}px` }}>
                  {heatmapView.xLabels.map((tick) => (
                    <span key={`${tick.label}-${tick.column}`} style={{ left: `${tick.column * 17}px` }}>
                      {tick.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-5 rounded-[20px] bg-white/[0.28] p-4 text-sm leading-6 text-[rgb(var(--text-muted))] dark:bg-white/[0.06]">
            {COPY.heatmapEmpty}
          </p>
        )}
      </GlassCard>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassCard className="p-5">
          <ChartTitle title={COPY.intimacy} />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart data={intimacyData} innerRadius="72%" outerRadius="100%" startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={18} background={{ fill: 'rgba(255,255,255,0.22)' }} />
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-[rgb(var(--text-primary))] text-4xl font-semibold">
                  {intimacyScore}
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <ChartTitle title={COPY.emotion} />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={emotionCurve} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.36)" vertical={false} />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: 'rgb(var(--text-muted))', fontSize: 11 }} />
                <YAxis domain={[-1, 1]} tickLine={false} axisLine={false} tick={{ fill: 'rgb(var(--text-muted))', fontSize: 11 }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line type="monotone" dataKey="score" stroke="#4f8cff" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard className="p-5">
          <ChartTitle title={COPY.dependenceChart} />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dependenceData} margin={{ top: 14, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.36)" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'rgb(var(--text-muted))', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: 'rgb(var(--text-muted))', fontSize: 11 }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="value" radius={[12, 12, 12, 12]}>
                  {dependenceData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <ChartTitle title={COPY.personality} />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.42)" />
                <PolarAngleAxis dataKey="label" tick={{ fill: 'rgb(var(--text-muted))', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name={personA} dataKey="personA" stroke="#4f8cff" fill="#4f8cff" fillOpacity={0.28} />
                <Radar name={personB} dataKey="personB" stroke="#ff8f70" fill="#ff8f70" fillOpacity={0.2} />
                <Tooltip contentStyle={chartTooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <MbtiBadge name={personA} value={languageReport.person_a?.mbti} />
            <MbtiBadge name={personB} value={languageReport.person_b?.mbti} />
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <ChartTitle title={COPY.mbtiResult} />
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <MbtiReportCard name={personA} person={languageReport.person_a} />
          <MbtiReportCard name={personB} person={languageReport.person_b} />
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[16px] bg-white/55 text-[#6e6e73] shadow-soft dark:bg-white/10">
                <Sparkles size={18} strokeWidth={1.8} />
              </span>
              <div>
                <ChartTitle title={COPY.smartTitle} />
                <p className="mt-1 text-xs leading-5 text-[rgb(var(--text-muted))]">{COPY.smartHint}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {smartOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={selectedSmartKeys.includes(option.key) ? 'smart-option smart-option-active' : 'smart-option'}
                  onClick={() => {
                    setHasRunSmartAnalysis(false)
                    setSelectedSmartKeys((current) =>
                      current.includes(option.key) ? current.filter((key) => key !== option.key) : [...current, option.key],
                    )
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <GlassButton
            className="primary-gradient-button inline-flex min-h-11 items-center justify-center gap-2 px-5 py-3 text-sm font-semibold"
            disabled={!selectedSmartKeys.length}
            onClick={() => setHasRunSmartAnalysis(true)}
          >
            <Gauge size={16} strokeWidth={1.8} />
            {COPY.smartRun}
          </GlassButton>
        </div>

        {hasRunSmartAnalysis && selectedSmartKeys.length ? (
          <div className="mt-5 grid gap-4">
            {selectedSmartKeys.includes('dominance') ? (
              <SmartTwinPanel
                icon={<Brain size={17} strokeWidth={1.8} />}
                title="攻/受分析"
                left={smartInsights.dominance.personA}
                right={smartInsights.dominance.personB}
                leftName={personA}
                rightName={personB}
                minLabel="攻"
                maxLabel="受"
              />
            ) : null}
            {selectedSmartKeys.includes('mood') ? (
              <SmartTwinPanel
                icon={<Smile size={17} strokeWidth={1.8} />}
                title="心情分析"
                left={smartInsights.mood.personA}
                right={smartInsights.mood.personB}
                leftName={personA}
                rightName={personB}
                minLabel="笑脸"
                maxLabel="哭脸"
                maxIcon={<Frown size={15} strokeWidth={1.8} />}
              />
            ) : null}
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {selectedSmartKeys.includes('loveBrain') ? <SmartMeter title="恋爱脑分析" value={smartInsights.loveBrain} /> : null}
              {selectedSmartKeys.includes('showOff') ? <SmartMeter title="嘉豪程度分析" value={smartInsights.showOff} /> : null}
              {selectedSmartKeys.includes('trust') ? <SmartMeter title="可信任程度分析" value={smartInsights.trust} icon={<ShieldCheck size={16} strokeWidth={1.8} />} /> : null}
              {selectedSmartKeys.includes('iq') ? <SmartMeter title="智商分析" value={smartInsights.iq} icon={<Brain size={16} strokeWidth={1.8} />} /> : null}
            </div>
          </div>
        ) : (
          <p className="mt-5 rounded-[20px] bg-white/[0.28] p-4 text-sm leading-6 text-[rgb(var(--text-muted))] dark:bg-white/[0.06]">
            {selectedSmartKeys.length ? COPY.smartHint : COPY.smartEmpty}
          </p>
        )}
      </GlassCard>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="p-6">
          <ChartTitle title={COPY.summary} />
          <p className="mt-4 text-base leading-8 text-[rgb(var(--text-secondary))]">
            {report.summary_text || COPY.defaultSummary}
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <ChartTitle title={COPY.suggestions} />
          <div className="mt-4 space-y-3">
            {suggestions.map((suggestion) => (
              <div key={suggestion} className="rounded-2xl bg-white/[0.24] px-4 py-3 text-sm leading-6 text-[rgb(var(--text-secondary))] dark:bg-white/[0.06]">
                {suggestion}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </section>
  )
}

function ChartTitle({ title }: { title: string }) {
  return <h2 className="text-base font-semibold text-[rgb(var(--text-primary))]">{title}</h2>
}

function MbtiBadge({ name, value }: { name: string; value?: string }) {
  return (
    <div className="rounded-[18px] bg-white/[0.28] px-4 py-3 shadow-soft dark:bg-white/[0.06]">
      <p className="text-xs font-medium text-[rgb(var(--text-muted))]">{name}</p>
      <p className="mt-1 text-sm font-semibold text-[rgb(var(--text-primary))]">MBTI: {value || '观察中'}</p>
    </div>
  )
}

function MbtiReportCard({ name, person }: { name: string; person?: LanguagePersonReport }) {
  const values = buildMbtiTraitValues(person)
  return (
    <div className="mbti-report-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[rgb(var(--text-muted))]">{name}</p>
          <h3 className="mt-1 text-2xl font-semibold leading-tight text-[rgb(var(--text-primary))]">{person?.mbti || '观察中'}</h3>
        </div>
        <span className="rounded-full bg-white/[0.72] px-3 py-1 text-xs font-semibold text-[rgb(var(--text-muted))]">
          MBTI
        </span>
      </div>
      <div className="mt-5 grid gap-5">
        {values.map((trait) => (
          <MbtiTraitSlider key={trait.label} {...trait} />
        ))}
      </div>
    </div>
  )
}

function MbtiTraitSlider({ left, right, value, label }: { left: string; right: string; value: number; label: string }) {
  return (
    <div>
      <div className="mbti-trait-labels">
        <span>{left}</span>
        <span>{label}</span>
        <span>{right}</span>
      </div>
      <div className="mbti-trait-track" aria-label={label}>
        <span className="mbti-trait-midline" />
        <span className="mbti-trait-fill" style={{ width: `${value}%` }} />
        <span className="mbti-trait-thumb" style={{ left: `${value}%` }} />
      </div>
    </div>
  )
}

function SmartTwinPanel({
  icon,
  left,
  leftName,
  maxIcon,
  maxLabel,
  minLabel,
  right,
  rightName,
  title,
}: {
  icon: ReactNode
  left: number
  leftName: string
  maxIcon?: ReactNode
  maxLabel: string
  minLabel: string
  right: number
  rightName: string
  title: string
}) {
  return (
    <div className="smart-panel">
      <div className="flex items-center gap-2">
        <span className="smart-panel-icon">{icon}</span>
        <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">{title}</h3>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <SmartPersonScale name={leftName} value={left} minLabel={minLabel} maxLabel={maxLabel} maxIcon={maxIcon} />
        <SmartPersonScale name={rightName} value={right} minLabel={minLabel} maxLabel={maxLabel} maxIcon={maxIcon} />
      </div>
    </div>
  )
}

function SmartPersonScale({
  maxIcon,
  maxLabel,
  minLabel,
  name,
  value,
}: {
  maxIcon?: ReactNode
  maxLabel: string
  minLabel: string
  name: string
  value: number
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm font-semibold text-[rgb(var(--text-primary))]">{name}</p>
        <p className="text-xs font-medium text-[rgb(var(--text-muted))]">{value}%</p>
      </div>
      <div className="smart-scale-labels">
        <span>{minLabel}</span>
        <span className="inline-flex items-center gap-1">
          {maxIcon}
          {maxLabel}
        </span>
      </div>
      <div className="smart-meter-track">
        <span className="smart-meter-fill" style={{ width: `${value}%` }} />
        <span className="smart-meter-thumb" style={{ left: `${value}%` }} />
      </div>
    </div>
  )
}

function SmartMeter({ icon, title, value }: { icon?: ReactNode; title: string; value: number }) {
  return (
    <div className="smart-meter-card">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{title}</p>
        {icon ? <span className="text-[rgb(var(--text-muted))]">{icon}</span> : null}
      </div>
      <div className="smart-scale-labels">
        <span>0%</span>
        <span>100%</span>
      </div>
      <div className="smart-meter-track">
        <span className="smart-meter-fill" style={{ width: `${value}%` }} />
        <span className="smart-meter-thumb" style={{ left: `${value}%` }} />
      </div>
      <p className="mt-3 text-right text-xs font-semibold text-[rgb(var(--text-muted))]">{value}%</p>
    </div>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function normalizeRatio(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0
  }
  return value > 1 ? clamp(value, 0, 100) / 100 : clamp(value, 0, 1)
}

function percent(value?: number) {
  return Math.round(normalizeRatio(value) * 100)
}

function average(values: Array<number | undefined>) {
  const validValues = values.filter((value): value is number => typeof value === 'number' && !Number.isNaN(value))
  return validValues.length ? validValues.reduce((sum, value) => sum + value, 0) / validValues.length : 0
}

function ratioText(value?: number) {
  return `${percent(value)}%`
}

function delayText(delay?: { person_a?: number; person_b?: number }) {
  const seconds = average([delay?.person_a, delay?.person_b])
  if (!seconds) {
    return '0s'
  }
  return seconds >= 60 ? `${Math.round(seconds / 60)}min` : `${Math.round(seconds)}s`
}

function buildEmotionCurve(curve?: { timestamp: string; score: number }[]) {
  const source = curve?.length ? curve : [{ timestamp: new Date().toISOString(), score: 0 }]
  return source.slice(0, 80).map((point) => ({
    time: formatTime(point.timestamp),
    score: Number(point.score.toFixed(2)),
  }))
}

function buildRadarData(personA?: LanguagePersonReport, personB?: LanguagePersonReport) {
  return [
    { label: '\u5916\u5411', personA: percent(personA?.extroversion), personB: percent(personB?.extroversion) },
    { label: '\u7406\u6027', personA: percent(personA?.rationality), personB: percent(personB?.rationality) },
    { label: '\u611f\u6027', personA: percent(personA?.emotionality), personB: percent(personB?.emotionality) },
    { label: '\u73a9\u5fc3', personA: percent(personA?.playfulness), personB: percent(personB?.playfulness) },
  ]
}

function buildMbtiTraitValues(person?: LanguagePersonReport) {
  const mbti = (person?.mbti || '').toUpperCase()
  return [
    { left: 'I', right: 'E', label: 'I / E', value: mbti.includes('E') ? 68 : mbti.includes('I') ? 32 : percent(person?.extroversion) },
    { left: 'S', right: 'N', label: 'S / N', value: mbti.includes('N') ? 64 : mbti.includes('S') ? 36 : percent(person?.playfulness) },
    { left: 'T', right: 'F', label: 'T / F', value: mbti.includes('F') ? 66 : mbti.includes('T') ? 34 : 100 - percent(person?.rationality) },
    { left: 'J', right: 'P', label: 'J / P', value: mbti.includes('P') ? 62 : mbti.includes('J') ? 38 : percent(person?.playfulness) },
  ].map((trait) => ({ ...trait, value: clamp(trait.value, 8, 92) }))
}

function buildHeatmapView(report: FinalReport, range: HeatmapRange) {
  if (range === 'day') {
    const cells = normalizeHourlyHeatmap(report.chat_hourly_heatmap)
    const columns = cells.length
    return {
      cells,
      columns,
      rows: 1,
      axisWidth: heatmapAxisWidth(columns),
      xLabels: [
        { label: '00:00', column: 0 },
        { label: '06:00', column: 6 },
        { label: '12:00', column: 12 },
        { label: '18:00', column: 18 },
        { label: '23:00', column: 23 },
      ],
      yLabels: [{ label: '当天', row: 0 }],
    }
  }

  const weeks = range === 'week' ? 1 : range === 'month' ? 5 : 53
  const cells = normalizeHeatmap(report.chat_heatmap, weeks * 7)
  const columns = Math.ceil(cells.length / 7)
  return {
    cells,
    columns,
    rows: 7,
    axisWidth: heatmapAxisWidth(columns),
    xLabels: buildHeatmapXLabels(cells, range, columns),
    yLabels: buildHeatmapYLabels(),
  }
}

function buildHeatmapYLabels(): HeatmapYTick[] {
  return [
    { label: '一', row: 0 },
    { label: '三', row: 2 },
    { label: '五', row: 4 },
    { label: '日', row: 6 },
  ]
}

function normalizeHeatmap(source?: HeatmapCell[], days = 70) {
  const counts = new Map((source ?? []).map((cell) => [cell.date, cell.count]))
  const today = new Date()
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (days - 1 - index))
    const key = date.toISOString().slice(0, 10)
    return { date: key, count: counts.get(key) ?? 0 }
  })
}

function normalizeHourlyHeatmap(source?: HeatmapCell[]) {
  if (source?.length) {
    return source.slice(0, 24)
  }

  const today = new Date().toISOString().slice(0, 10)
  return Array.from({ length: 24 }, (_, hour) => ({
    date: `${today}T${String(hour).padStart(2, '0')}:00`,
    count: 0,
  }))
}

function buildHeatmapXLabels(cells: HeatmapCell[], range: HeatmapRange, columns: number): HeatmapTick[] {
  if (range === 'week') {
    return [{ label: '近7天', column: 0 }]
  }
  if (range === 'month') {
    return pickAxisTicks(cells, columns, 5).map((tick) => ({ ...tick, label: formatMonthDay(tick.label) }))
  }
  return pickAxisTicks(cells, columns, 7).map((tick) => {
    const date = new Date(tick.label)
    return { ...tick, label: Number.isNaN(date.getTime()) ? tick.label : `${date.getMonth() + 1}月` }
  })
}

function pickAxisTicks(cells: HeatmapCell[], columns: number, count: number): HeatmapTick[] {
  if (!cells.length) {
    return []
  }
  return Array.from({ length: count }, (_, index) => {
    const column = Math.round((index / Math.max(1, count - 1)) * Math.max(0, columns - 1))
    const cellIndex = Math.min(cells.length - 1, column * 7)
    return { label: cells[cellIndex].date, column }
  })
}

function heatmapAxisWidth(columns: number) {
  return Math.max(12, columns * 17 - 5)
}

function buildSmartInsights({
  emotionReport,
  interactionReport,
  intimacyScore,
  languagePersonA,
  languagePersonB,
}: {
  personA: string
  personB: string
  languagePersonA?: LanguagePersonReport
  languagePersonB?: LanguagePersonReport
  emotionReport: { positive_ratio?: number; negative_ratio?: number; neutral_ratio?: number }
  interactionReport: {
    dependence_score?: { person_a?: number; person_b?: number }
    initiation_ratio?: { person_a?: number; person_b?: number }
    tacit_score?: number
  }
  intimacyScore: number
}) {
  const positive = percent(emotionReport.positive_ratio)
  const negative = percent(emotionReport.negative_ratio)
  const tacit = percent(interactionReport.tacit_score)
  const dependenceA = percent(interactionReport.dependence_score?.person_a)
  const dependenceB = percent(interactionReport.dependence_score?.person_b)
  const initiationA = percent(interactionReport.initiation_ratio?.person_a)
  const initiationB = percent(interactionReport.initiation_ratio?.person_b)
  const rationality = Math.round(average([languagePersonA?.rationality, languagePersonB?.rationality]) * 100)
  const playfulness = Math.round(average([languagePersonA?.playfulness, languagePersonB?.playfulness]) * 100)
  const extroversion = Math.round(average([languagePersonA?.extroversion, languagePersonB?.extroversion]) * 100)

  return {
    dominance: {
      personA: clamp(Math.round(100 - initiationA * 0.55 - dependenceA * 0.25 + dependenceB * 0.2), 0, 100),
      personB: clamp(Math.round(100 - initiationB * 0.55 - dependenceB * 0.25 + dependenceA * 0.2), 0, 100),
    },
    mood: {
      personA: clamp(Math.round(negative * 0.7 + (100 - positive) * 0.25), 0, 100),
      personB: clamp(Math.round(negative * 0.7 + (100 - positive) * 0.25), 0, 100),
    },
    loveBrain: clamp(Math.round(intimacyScore * 0.48 + average([dependenceA, dependenceB]) * 0.34 + tacit * 0.18), 0, 100),
    showOff: clamp(Math.round(extroversion * 0.42 + playfulness * 0.36 + rationality * 0.12), 0, 100),
    trust: clamp(Math.round(positive * 0.36 + tacit * 0.34 + intimacyScore * 0.2 + rationality * 0.1), 0, 100),
    iq: clamp(Math.round(rationality * 0.7 + tacit * 0.2 + positive * 0.1), 0, 100),
  }
}

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatMonthDay(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export default ResultPage
