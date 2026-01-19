import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from 'chart.js'
import { Pie, Line, Bar } from 'react-chartjs-2'

import useInsightsOverview from '../../hooks/useInsightsOverview'
import { SkeletonCard } from '../../components/ui/Skeleton'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement)

const toChartDataset = (series = [], { label = 'Value', color = '#2563eb', fill = false, type = 'line' } = {}) => {
  const labels = series.map((point) => point.label ?? '')
  const data = series.map((point) => Number(point.value ?? 0))

  if (type === 'pie') {
    return {
      labels,
      datasets: [
        {
          label,
          data,
          backgroundColor: ['#2563eb', '#22c55e', '#f97316', '#14b8a6', '#6366f1', '#0ea5e9'],
          borderWidth: 0,
        },
      ],
    }
  }

  if (type === 'bar') {
    return {
      labels,
      datasets: [
        {
          label,
          data,
          backgroundColor: '#22d3ee',
          borderRadius: 16,
          maxBarThickness: 42,
        },
      ],
    }
  }

  return {
    labels,
    datasets: [
      {
        label,
        data,
        tension: 0.4,
        borderColor: color,
        backgroundColor: fill ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
        fill,
        pointRadius: 4,
        pointBackgroundColor: color,
      },
    ],
  }
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#475569',
        font: { size: 11, family: 'Inter, system-ui, sans-serif' },
      },
    },
    tooltip: {
      backgroundColor: '#0f172a',
      titleColor: '#e2e8f0',
      bodyColor: '#e2e8f0',
      padding: 12,
      cornerRadius: 16,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#94a3b8', font: { size: 11 } },
    },
    y: {
      grid: { color: 'rgba(148, 163, 184, 0.15)' },
      ticks: { color: '#94a3b8', font: { size: 11 } },
      beginAtZero: true,
    },
  },
}

const donutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#475569',
        font: { size: 11 },
      },
    },
  },
}

const Insights = () => {
  const navigate = useNavigate()
  const { role, metrics, charts, spotlight, recentActivity, detailLinks, loading, error, refresh } = useInsightsOverview()

  const chartData = useMemo(() => {
    const sessionsSeries = charts?.sessionsByMonth ?? []
    const breakdownSeries = charts?.engagementBreakdown ?? []
    const funnelSeries = charts?.conversionFunnel ?? []

    return {
      sessions: toChartDataset(sessionsSeries, { label: 'Sessions', fill: true, color: '#2563eb', type: 'line' }),
      breakdown: toChartDataset(breakdownSeries, { label: 'Engagement mix', type: 'pie' }),
      funnel: toChartDataset(funnelSeries, { label: 'Volume', type: 'bar' }),
    }
  }, [charts])

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard className="h-32" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={`metric-skeleton-${index}`} className="h-40" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <SkeletonCard className="h-72" />
          <SkeletonCard className="h-72" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <SkeletonCard className="h-72" />
          <SkeletonCard className="h-72" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 rounded-3xl border border-rose-200 bg-rose-50/60 p-8 text-rose-600">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">We couldn’t load your insights</h1>
          <p className="text-sm">{error?.message ?? 'Please try refreshing the page or check back later.'}</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-700"
        >
          Retry loading
        </button>
      </div>
    )
  }

  const handleNavigate = (detailKey) => {
    if (!detailKey) return
    const href = detailLinks?.[detailKey]
    if (href) {
      navigate(href)
    }
  }

  const metricsByRole = Array.isArray(metrics)
    ? metrics.map((metric) => ({
        ...metric,
        detailKey: metric.detailKey || metric.id,
      }))
    : []

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Insights</p>
        <h1 className="text-3xl font-bold text-slate-900">
          {role === 'student' && 'Your mentorship journey insights'}
          {role === 'alumni' && 'Mentor performance insights'}
          {role === 'faculty' && 'Faculty engagement insights'}
          {!role && 'Community insights'}
        </h1>
        <p className="max-w-3xl text-sm text-slate-500">
          {role === 'student' && 'Track sessions, requests, and events aligned with your goals.'}
          {role === 'alumni' && 'Monitor mentee engagement, service demand, and feedback trends.'}
          {role === 'faculty' && 'See the impact of events and opportunities you drive.'}
          {!role && 'Stay updated with real-time community metrics and activity.'}
        </p>
      </header>

      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        {metricsByRole.map((metric) => (
          <MetricCard key={metric.id} metric={metric} onClick={() => handleNavigate(metric.detailKey)} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Monthly activity trend</h2>
              <p className="text-xs text-slate-400">How your engagement has evolved over time</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Last 6 months
            </span>
          </header>
          <div className="mt-6 h-64">
            <Line data={chartData.sessions} options={chartOptions} />
          </div>
        </article>

        <article className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Engagement mix</h2>
            <p className="mt-1 text-xs text-slate-400">Distribution across core activities</p>
            <div className="mt-6 h-56">
              <Pie data={chartData.breakdown} options={donutOptions} />
            </div>
          </div>
          <div className="space-y-4 border-t border-slate-100 pt-4 text-sm text-slate-600 lg:border-l lg:border-t-0 lg:pl-6">
            {chartData.breakdown.datasets[0].data.map((value, index) => (
              <InsightStat
                key={`breakdown-${index}`}
                value={`${value}`}
                label={chartData.breakdown.labels[index]}
                detail={role === 'alumni' ? 'Mentor activity' : 'Community engagement'}
                accent={index === 0 ? 'primary' : index === 1 ? 'emerald' : index === 2 ? 'amber' : 'sky'}
              />
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Pipeline progression</h2>
              <p className="text-xs text-slate-400">Track how requests move through each stage</p>
            </div>
            {detailLinks?.requests ? (
              <button
                type="button"
                onClick={() => handleNavigate('requests')}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-primary hover:text-primary"
              >
                View requests
              </button>
            ) : null}
          </header>
          <div className="mt-6 h-64">
            <Bar data={chartData.funnel} options={chartOptions} />
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
              <p className="text-xs text-slate-400">Latest interactions across sessions, requests, and events</p>
            </div>
            {detailLinks?.sessions ? (
              <button
                type="button"
                onClick={() => handleNavigate('sessions')}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-primary hover:text-primary"
              >
                View sessions
              </button>
            ) : null}
          </header>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {recentActivity?.slice(0, 4).map((item) => (
              <InsightListItem
                key={item.id}
                value={new Date(item.timestamp).toLocaleDateString()}
                label={item.title}
                detail={`${item.type ?? ''}${item.subtitle ? ` • ${item.subtitle}` : ''}`}
              />
            ))}
            {!recentActivity?.length ? (
              <li className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-500">
                No recent activity recorded yet.
              </li>
            ) : null}
          </ul>
        </article>
      </section>

      {spotlight?.length ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {spotlight.map((post) => (
            <article
              key={post.id}
              className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">Spotlight</p>
                <h2 className="text-xl font-semibold text-slate-900">{post.title}</h2>
                <p className="text-sm text-slate-500">{post.description}</p>
              </div>
              <button
                type="button"
                onClick={() => handleNavigate(post.detailKey || post.href?.split('/').pop())}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80"
              >
                {post.ctaLabel || 'View details'}
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  )
}

const MetricCard = ({ metric, onClick }) => {
  const accentMap = {
    primary: 'text-primary bg-primary/10',
    emerald: 'text-emerald-500 bg-emerald-50',
    sky: 'text-sky-500 bg-sky-50',
    violet: 'text-violet-500 bg-violet-50',
    amber: 'text-amber-500 bg-amber-50',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col justify-between rounded-2xl border border-transparent bg-slate-50/50 px-4 py-5 text-left transition hover:border-primary/40 hover:bg-white"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{metric.label}</p>
        <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
      </div>
      {metric.delta ? (
        <span
          className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${accentMap[metric.accent || 'primary']}`}
        >
          {metric.delta}
        </span>
      ) : null}
    </button>
  )
}

const InsightStat = ({ value, label, detail, accent }) => {
  const accentMap = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    sky: 'bg-sky-100 text-sky-600',
    violet: 'bg-violet-100 text-violet-600',
  }

  return (
    <div className="space-y-1">
      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${accentMap[accent] || accentMap.primary}`}>
        {label}
      </span>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{detail}</p>
    </div>
  )
}

const InsightListItem = ({ value, label, detail }) => (
  <li className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3">
    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
      {value}
    </span>
    <div>
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="text-xs text-slate-500">{detail}</p>
    </div>
  </li>
)

export default Insights
