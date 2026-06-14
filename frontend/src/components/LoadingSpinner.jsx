import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-brand-200 dark:border-brand-900" />
        <div className="absolute inset-0 rounded-full border-4 border-t-brand-500 animate-spin" />
      </div>
      <p className="text-sm font-medium text-surface-700 dark:text-surface-200 animate-pulse">
        Calculating route &amp; generating logs…
      </p>
    </div>
  );
}
