import React from 'react';

export default function DarkModeToggle({ dark, setDark }) {
  return (
    <button
      id="dark-mode-toggle"
      onClick={() => setDark(!dark)}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl
                 bg-surface-200 dark:bg-surface-700
                 hover:bg-surface-300 dark:hover:bg-surface-600
                 transition-all duration-200"
      aria-label="Toggle dark mode"
    >
      {dark ? (
        /* Sun icon */
        <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        /* Moon icon */
        <svg className="w-5 h-5 text-surface-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
