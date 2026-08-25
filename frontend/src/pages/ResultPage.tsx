import { RefreshCw } from 'lucide-react'
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
import type { FinalReport, LanguagePersonReport } from '../types'

type ResultPageProps = {
  report: FinalReport | null
  onReset: () => void
}

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
            <GlassButton className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold" onClick={onReset}>
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
        </GlassCard>
      </div>

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

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export default ResultPage
