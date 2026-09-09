import React, { useState, useEffect } from 'react'
import { AlertTriangle, Info, XCircle, X } from 'lucide-react'
import { ServiceAlertItem } from '../../types/transit'
import { transitApi } from '../../services/transitApi'

export const ServiceAlertsBanner: React.FC = () => {
  const [alerts, setAlerts] = useState<ServiceAlertItem[]>([])
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    transitApi.getAlerts().then((data) => {
      if (data && data.length > 0) setAlerts(data)
    })
  }, [])

  if (isDismissed || alerts.length === 0) return null

  const activeAlert = alerts[0]

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return { bg: 'bg-red-50 border-red-200 text-red-900', icon: XCircle, iconColor: 'text-red-600' }
      case 'WARNING':
        return { bg: 'bg-amber-50 border-amber-200 text-amber-900', icon: AlertTriangle, iconColor: 'text-amber-600' }
      default:
        return { bg: 'bg-blue-50 border-blue-200 text-blue-900', icon: Info, iconColor: 'text-blue-600' }
    }
  }

  const badge = getSeverityBadge(activeAlert.severity)
  const Icon = badge.icon

  return (
    <div className={`${badge.bg} border rounded-2xl p-3.5 flex items-start justify-between gap-3 shadow-xs transition-all`}>
      <div className="flex items-start space-x-2.5">
        <Icon className={`w-4 h-4 ${badge.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="text-xs">
          <div className="font-bold flex items-center gap-2">
            <span>{activeAlert.title}</span>
            {activeAlert.delay_impact_mins > 0 && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-900">
                +{activeAlert.delay_impact_mins} min delay
              </span>
            )}
          </div>
          <p className="mt-0.5 leading-relaxed opacity-90">{activeAlert.description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-xs flex items-center justify-center"
        title="Dismiss alert"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
