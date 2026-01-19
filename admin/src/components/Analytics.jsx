import React, { useState } from 'react'

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d')
  
  const stats = [
    { label: 'Total Users', value: '1,247', change: '+12%', trend: 'up' },
    { label: 'Active Sessions', value: '342', change: '+8%', trend: 'up' },
    { label: 'Page Views', value: '8,945', change: '+23%', trend: 'up' },
    { label: 'Avg. Session', value: '5m 23s', change: '-2%', trend: 'down' },
  ]

  const chartData = [
    { date: 'Jan 1', users: 1200, sessions: 340, pageViews: 8500 },
    { date: 'Jan 7', users: 1235, sessions: 345, pageViews: 8700 },
    { date: 'Jan 14', users: 1247, sessions: 342, pageViews: 8945 },
    { date: 'Jan 21', users: 1260, sessions: 350, pageViews: 9100 },
    { date: 'Jan 28', users: 1280, sessions: 360, pageViews: 9300 },
  ]

  const topPages = [
    { page: '/dashboard', views: 3456, percentage: 38.6 },
    { page: '/events', views: 1234, percentage: 13.8 },
    { page: '/opportunities', views: 987, percentage: 11.0 },
    { page: '/alumni', views: 765, percentage: 8.5 },
    { page: '/news', views: 543, percentage: 6.1 },
  ]

  const userGrowth = [
    { month: 'Sep', users: 1100 },
    { month: 'Oct', users: 1150 },
    { month: 'Nov', users: 1200 },
    { month: 'Dec', users: 1247 },
    { month: 'Jan', users: 1280 },
  ]

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
        <p className="text-slate-600">Monitor platform performance and user engagement.</p>
      </header>

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
          <span className="text-sm text-slate-500">Last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
              timeRange === '7d' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            7 days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
              timeRange === '30d' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            30 days
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
              timeRange === '90d' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            90 days
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500">{stat.label}</span>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                <svg className={`h-3 w-3 ${stat.trend === 'up' ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">User Growth</h3>
          <div className="space-y-4">
            {userGrowth.map((data) => (
              <div key={data.month} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{data.month}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${(data.users / 1300) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-900 w-12 text-right">{data.users}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Pages</h3>
          <div className="space-y-3">
            {topPages.map((page) => (
              <div key={page.page} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">{page.page}</div>
                  <div className="text-xs text-slate-500">{page.views.toLocaleString()} views</div>
                </div>
                <div className="text-sm font-medium text-slate-900">{page.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Traffic Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Users</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sessions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Page Views</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chartData.map((data) => (
                <tr key={data.date} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-sm font-medium text-slate-900">{data.date}</td>
                  <td className="px-4 py-4 text-sm text-slate-900">{data.users.toLocaleString()}</td>
                  <td className="px-4 py-4 text-sm text-slate-900">{data.sessions.toLocaleString()}</td>
                  <td className="px-4 py-4 text-sm text-slate-900">{data.pageViews.toLocaleString()}</td>
                  <td className="px-4 py-4 text-sm text-slate-900">5m 23s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Device Types</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Desktop</span>
              <span className="text-sm font-medium text-slate-900">65%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Mobile</span>
              <span className="text-sm font-medium text-slate-900">30%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '30%' }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Tablet</span>
              <span className="text-sm font-medium text-slate-900">5%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '5%' }} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Traffic Sources</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Direct</span>
              <span className="text-sm font-medium text-slate-900">45%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-red-600 h-2 rounded-full" style={{ width: '45%' }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Search</span>
              <span className="text-sm font-medium text-slate-900">30%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: '30%' }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Social</span>
              <span className="text-sm font-medium text-slate-900">15%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '15%' }} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">User Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Daily Active</span>
              <span className="text-sm font-medium text-slate-900">342</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Weekly Active</span>
              <span className="text-sm font-medium text-slate-900">1,156</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Monthly Active</span>
              <span className="text-sm font-medium text-slate-900">1,247</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">New Users</span>
              <span className="text-sm font-medium text-slate-900">47</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Analytics
