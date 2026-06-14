import React, { useState, useEffect } from 'react';
import { planTrip } from './api';
import Header from './components/Header';
import TripForm from './components/TripForm';
import SummaryCards from './components/SummaryCards';
import RouteMap from './components/RouteMap';
import FuelStopsTimeline from './components/FuelStopsTimeline';
import LogSheetViewer from './components/LogSheetViewer';
import LoadingSpinner from './components/LoadingSpinner';

export default function App() {
  // ── Dark mode ─────────────────────────────────────────────
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eld-dark-mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('eld-dark-mode', dark);
  }, [dark]);

  // ── Form state ────────────────────────────────────────────
  const [form, setForm] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_used_hours: 0,
  });

  // ── Result state ──────────────────────────────────────────
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Submit handler ────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await planTrip(form);
      setResult(data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen transition-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Header dark={dark} setDark={setDark} />

        {/* Main grid: form + map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Left column: form */}
          <div className="lg:col-span-4">
            <TripForm form={form} setForm={setForm} onSubmit={handleSubmit} loading={loading} />
          </div>

          {/* Right column: map or placeholder */}
          <div className="lg:col-span-8">
            {result?.route ? (
              <RouteMap route={result.route} fuelStops={result.fuel_stops} />
            ) : (
              <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card flex items-center justify-center transition-theme"
                   style={{ height: 470 }}>
                <div className="text-center px-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-100 dark:bg-brand-900/30
                                  flex items-center justify-center">
                    <svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-1">
                    Plan Your Route
                  </h3>
                  <p className="text-sm text-surface-700 dark:text-surface-200 opacity-60">
                    Enter trip details on the left to generate your route, ELD logs, and compliance plan.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                          text-red-700 dark:text-red-300 text-sm font-medium flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && <LoadingSpinner />}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6">
            {/* Summary cards */}
            <SummaryCards summary={result.summary} />

            {/* Timeline + Log sheets */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-4">
                <FuelStopsTimeline dailyLogs={result.daily_logs} />
              </div>
              <div className="xl:col-span-8">
                <LogSheetViewer dailyLogs={result.daily_logs} />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-surface-200 dark:border-surface-700 text-center">
          <p className="text-xs text-surface-700 dark:text-surface-200 opacity-40">
            ELD Route Planner · FMCSA Compliant Log Generator · Property-Carrying · 70hr/8day Rule
          </p>
        </footer>
      </div>
    </div>
  );
}
