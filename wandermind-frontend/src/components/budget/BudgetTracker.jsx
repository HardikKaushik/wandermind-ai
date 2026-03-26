import { motion } from 'framer-motion'
import { TrendingDown, MessageSquare } from 'lucide-react'
import { useBudget } from '../../hooks/useBudget'

const CATEGORIES = [
  { key: 'hotels_inr', label: 'Hotels', icon: '🏨', color: 'bg-blue-500' },
  { key: 'food_inr', label: 'Food', icon: '🍽️', color: 'bg-green-500' },
  { key: 'activities_inr', label: 'Activities', icon: '🎯', color: 'bg-purple-500' },
  { key: 'transport_inr', label: 'Transport', icon: '🚗', color: 'bg-amber-500' },
  { key: 'misc_inr', label: 'Misc', icon: '📦', color: 'bg-gray-500' },
]

const STATUS_COLORS = {
  safe: { bar: 'bg-green-500', text: 'text-green-700', label: 'Within budget' },
  warning: { bar: 'bg-amber-500', text: 'text-amber-700', label: 'Tight budget' },
  danger: { bar: 'bg-red-500', text: 'text-red-500', label: 'Over budget!' },
}

export default function BudgetTracker({ onOptimize }) {
  const { total, used, remaining, percentage, status, breakdown } = useBudget()

  if (!total) return null

  const statusConfig = STATUS_COLORS[status]

  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Budget Tracker
        </h3>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          status === 'safe' ? 'bg-green-50 text-green-700' :
          status === 'warning' ? 'bg-amber-500/10 text-amber-700' :
          'bg-red-500/10 text-red-500'
        }`}>
          {statusConfig.label}
        </span>
      </div>

      {/* Total bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-700">
            &#8377;{used.toLocaleString('en-IN')} used
          </span>
          <span className="font-mono font-semibold">
            &#8377;{total.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${statusConfig.bar}`}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-700">{percentage}% used</span>
          <span className={`text-xs font-mono ${statusConfig.text}`}>
            &#8377;{remaining.toLocaleString('en-IN')} left
          </span>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="space-y-2">
        {CATEGORIES.map(({ key, label, icon, color }) => {
          const amount = breakdown[key] || 0
          if (!amount) return null
          const catPct = total > 0 ? Math.round((amount / total) * 100) : 0

          return (
            <div key={key} className="space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-700">
                  {icon} {label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-gray-700">
                    &#8377;{amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-gray-700 w-8 text-right">
                    {catPct}%
                  </span>
                </div>
              </div>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${catPct}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className={`h-full rounded-full ${color}`}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Optimize button */}
      {status !== 'safe' && onOptimize && (
        <button
          onClick={onOptimize}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
                     bg-blue-600/10 border border-blue-600/20 text-blue-600
                     text-xs hover:bg-blue-600/20 transition-colors"
        >
          <MessageSquare size={12} />
          Ask AI to optimize budget
        </button>
      )}
    </div>
  )
}
