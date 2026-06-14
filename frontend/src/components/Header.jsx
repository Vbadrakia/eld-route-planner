import React from 'react';
import DarkModeToggle from './DarkModeToggle';

export default function Header({ dark, setDark }) {
  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        {/* Truck icon */}
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-brand-500 text-white shadow-md">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 00-.879-2.121l-2.12-2.12A3 3 0 0016.5 9H14.25m-2.25 9V5.625A1.125 1.125 0 0010.875 4.5H4.5a1.125 1.125 0 00-1.125 1.125v12.75" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-surface-900 dark:text-white">
            ELD Route Planner
          </h1>
          <p className="text-sm text-surface-700 dark:text-surface-200 opacity-70">
            Trip planning &amp; FMCSA daily log generator
          </p>
        </div>
      </div>
      <DarkModeToggle dark={dark} setDark={setDark} />
    </header>
  );
}
