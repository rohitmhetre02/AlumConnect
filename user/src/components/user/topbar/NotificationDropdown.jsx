import { notifications } from '../../../data/notifications'

const colors = {
  request: 'bg-blue-100 text-blue-600',
  reminder: 'bg-yellow-100 text-yellow-600',
  success: 'bg-green-100 text-green-600',
  info: 'bg-purple-100 text-purple-600',
}

const NotificationDropdown = ({ onViewAllActivity }) => {
  return (
    <div className="w-80 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
        <span>Notifications</span>
        <button className="text-xs text-primary">Mark all as read</button>
      </div>
      <div className="mt-3 space-y-3">
        {notifications.map((notification) => (
          <div key={notification.id} className="flex items-start gap-3 rounded-2xl bg-slate-50/70 px-3 py-2">
            <span className={`mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${colors[notification.type]}`}>
              •
            </span>
            <div>
              <p className="text-sm font-medium text-slate-900">{notification.title}</p>
              <p className="text-xs text-slate-400">{notification.time}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onViewAllActivity?.()}
        className="mt-3 w-full rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
      >
        View All Activity
      </button>
    </div>
  )
}

export default NotificationDropdown
