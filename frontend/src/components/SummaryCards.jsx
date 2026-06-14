import React from 'react';

const cards = [
  {
    key: 'total_distance_miles',
    label: 'Total Distance',
    unit: 'mi',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/30',
  },
  {
    key: 'total_driving_time_hr',
    label: 'Driving Time',
    unit: 'hrs',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/30',
  },
  {
    key: 'estimated_trip_days',
    label: 'Trip Days',
    unit: 'days',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/30',
  },
  {
    key: 'fuel_stops_count',
    label: 'Fuel Stops',
    unit: '',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
      </svg>
    ),
    color: 'text-red-500 bg-red-50 dark:bg-red-900/30',
  },
  {
    key: 'cycle_remaining_hours',
    label: 'Cycle Remaining',
    unit: 'hrs',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30',
  },
];

export default function SummaryCards({ summary }) {
  if (!summary) return null;
  return (
    <div id="summary-cards" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map(({ key, label, unit, icon, color }) => (
        <div
          key={key}
          className="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-card
                     hover:shadow-elevated transition-all duration-200 group"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${color}
                          group-hover:scale-110 transition-transform duration-200`}>
            {icon}
          </div>
          <p className="text-xs font-medium text-surface-700 dark:text-surface-200 opacity-60 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-xl font-extrabold text-surface-900 dark:text-white mt-0.5">
            {summary[key] ?? 0}
            {unit && <span className="text-sm font-medium opacity-50 ml-1">{unit}</span>}
          </p>
        </div>
      ))}
    </div>
  );
}
