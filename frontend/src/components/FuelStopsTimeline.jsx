import React from 'react';

const TYPE_STYLES = {
  driving:             { color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-900/30',   label: '🚛 Driving' },
  on_duty_not_driving: { color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-900/30', label: '📋 On Duty' },
  off_duty:            { color: '#6b7280', bg: 'bg-gray-50 dark:bg-gray-800/50',    label: '🛏 Off Duty' },
  sleeper_berth:       { color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-900/30',label: '😴 Sleeper' },
  fuel_stop:           { color: '#ef4444', bg: 'bg-red-50 dark:bg-red-900/30',      label: '⛽ Fuel Stop' },
  pickup:              { color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-900/30',  label: '📦 Pickup' },
  dropoff:             { color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/30', label: '🏁 Dropoff' },
};

export default function FuelStopsTimeline({ dailyLogs }) {
  if (!dailyLogs || dailyLogs.length === 0) return null;

  return (
    <div id="trip-timeline" className="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card transition-theme">
      <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
        </svg>
        Trip Timeline
      </h2>

      {dailyLogs.map((log, dayIdx) => (
        <div key={dayIdx} className="mb-6 last:mb-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
              Day {log.day} — {log.date}
            </span>
          </div>

          <div className="relative pl-6 border-l-2 border-surface-200 dark:border-surface-700">
            {log.events.map((ev, evIdx) => {
              const style = TYPE_STYLES[ev.type] || TYPE_STYLES.on_duty_not_driving;
              return (
                <div key={evIdx} className="relative mb-3 last:mb-0">
                  {/* Timeline dot */}
                  <div
                    className="absolute -left-[25px] top-2 w-3 h-3 rounded-full border-2 border-white dark:border-surface-800"
                    style={{ backgroundColor: style.color }}
                  />
                  <div className={`rounded-xl px-4 py-2.5 ${style.bg} transition-all duration-150 hover:scale-[1.01]`}>
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="text-sm font-semibold text-surface-900 dark:text-white">
                        {style.label}
                      </span>
                      <span className="text-xs font-mono text-surface-700 dark:text-surface-200 opacity-70">
                        {ev.start_time} – {ev.end_time} ({ev.duration_hours}h)
                      </span>
                    </div>
                    {ev.location && (
                      <p className="text-xs text-surface-700 dark:text-surface-200 opacity-60 mt-0.5">
                        {ev.location}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
