import React from 'react';

/**
 * TripForm — collects trip parameters and triggers route planning.
 */
export default function TripForm({ form, setForm, onSubmit, loading }) {
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const fields = [
    { key: 'current_location',  label: 'Current Location',  placeholder: 'e.g. Dallas, TX',  icon: '📍' },
    { key: 'pickup_location',   label: 'Pickup Location',   placeholder: 'e.g. Houston, TX', icon: '📦' },
    { key: 'dropoff_location',  label: 'Dropoff Location',  placeholder: 'e.g. Atlanta, GA', icon: '🏁' },
  ];

  return (
    <form
      id="trip-form"
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      className="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-card transition-theme"
    >
      <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-5 flex items-center gap-2">
        <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
        Trip Details
      </h2>

      {fields.map(({ key, label, placeholder, icon }) => (
        <div key={key} className="mb-4">
          <label htmlFor={key} className="block text-sm font-semibold text-surface-700 dark:text-surface-200 mb-1.5">
            {icon} {label}
          </label>
          <input
            id={key}
            type="text"
            value={form[key]}
            onChange={(e) => update(key, e.target.value)}
            placeholder={placeholder}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700
                       bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white
                       placeholder:text-surface-700/40 dark:placeholder:text-surface-200/30
                       focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500
                       transition-all duration-200"
          />
        </div>
      ))}

      <div className="mb-6">
        <label htmlFor="current_cycle_used_hours"
          className="block text-sm font-semibold text-surface-700 dark:text-surface-200 mb-1.5">
          ⏱ Current Cycle Used (hours)
        </label>
        <input
          id="current_cycle_used_hours"
          type="number"
          min="0"
          max="70"
          step="0.5"
          value={form.current_cycle_used_hours}
          onChange={(e) => update('current_cycle_used_hours', Number(e.target.value))}
          required
          className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700
                     bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500
                     transition-all duration-200"
        />
        <p className="text-xs text-surface-700/50 dark:text-surface-200/40 mt-1">
          70-hr / 8-day cycle · Remaining: {Math.max(0, 70 - form.current_cycle_used_hours)} hrs
        </p>
      </div>

      <button
        id="submit-trip"
        type="submit"
        disabled={loading}
        className="w-full py-3 px-6 rounded-xl font-bold text-white
                   bg-gradient-to-r from-brand-500 to-brand-600
                   hover:from-brand-600 hover:to-brand-700
                   disabled:opacity-50 disabled:cursor-not-allowed
                   shadow-md hover:shadow-lg transition-all duration-200
                   flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Planning…
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Generate Route &amp; Logs
          </>
        )}
      </button>
    </form>
  );
}
