import React from 'react';

/**
 * LogSheetCanvas — draws a single FMCSA-style ELD daily log sheet as SVG.
 *
 * The grid has 4 status rows × 24 hour columns.
 * Events are drawn as horizontal lines in the matching status row,
 * with vertical transition lines between status changes.
 */

const W = 820;     // SVG width
const H = 340;     // SVG height
const GRID_LEFT   = 120;
const GRID_TOP    = 60;
const GRID_WIDTH  = 672;  // 24 * 28px per hour
const ROW_HEIGHT  = 40;
const HOUR_WIDTH  = GRID_WIDTH / 24;

const STATUS_ROWS = [
  { key: 'off_duty',            label: 'Off Duty',   short: 'OFF' },
  { key: 'sleeper_berth',       label: 'Sleeper',    short: 'SB'  },
  { key: 'driving',             label: 'Driving',    short: 'D'   },
  { key: 'on_duty_not_driving', label: 'On Duty',    short: 'ON'  },
];

// Map event types to their row index (0–3)
function getRowIndex(type) {
  switch (type) {
    case 'off_duty':            return 0;
    case 'sleeper_berth':       return 1;
    case 'driving':             return 2;
    case 'on_duty_not_driving':
    case 'pickup':
    case 'dropoff':
    case 'fuel_stop':           return 3;
    default:                    return 3;
  }
}

// Parse "HH:MM" → fractional hours (0–24)
function parseTime(t) {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
}

export default function LogSheetCanvas({ log, carrierName, vehicleNumber }) {
  const { day, date, events, totals } = log;

  // Build line segments from events
  const segments = [];
  events.forEach((ev) => {
    const start = parseTime(ev.start_time);
    const end   = parseTime(ev.end_time);
    const row   = getRowIndex(ev.type);
    // Handle wrap-around (end < start means crosses midnight)
    if (end > start) {
      segments.push({ start, end, row, type: ev.type, location: ev.location });
    } else if (end < start) {
      segments.push({ start, end: 24, row, type: ev.type, location: ev.location });
      segments.push({ start: 0, end, row, type: ev.type, location: ev.location });
    }
  });

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const fg   = isDark ? '#e2e8f0' : '#1e293b';
  const grid = isDark ? '#334155' : '#cbd5e1';
  const bg   = isDark ? '#1e293b' : '#ffffff';
  const line  = '#12c9a4';

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      style={{ maxWidth: W }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width={W} height={H} fill={bg} rx={12} />

      {/* Title area */}
      <text x={14} y={24} fontSize={14} fontWeight={700} fill={fg} fontFamily="Inter, system-ui, sans-serif">
        Driver's Daily Log — Day {day}
      </text>
      <text x={14} y={42} fontSize={11} fill={fg} opacity={0.6} fontFamily="Inter, system-ui, sans-serif">
        Date: {date}  |  Carrier: {carrierName || 'N/A'}  |  Vehicle: {vehicleNumber || 'N/A'}
      </text>

      {/* Hour headers */}
      {Array.from({ length: 25 }, (_, i) => (
        <text
          key={`hdr-${i}`}
          x={GRID_LEFT + i * HOUR_WIDTH}
          y={GRID_TOP - 6}
          fontSize={9}
          fill={fg}
          textAnchor="middle"
          opacity={0.5}
          fontFamily="Inter, system-ui, sans-serif"
        >
          {i === 24 ? 'M' : i === 12 ? 'N' : i}
        </text>
      ))}

      {/* Status row labels */}
      {STATUS_ROWS.map((row, i) => (
        <text
          key={`label-${i}`}
          x={GRID_LEFT - 8}
          y={GRID_TOP + i * ROW_HEIGHT + ROW_HEIGHT / 2 + 4}
          fontSize={10}
          fontWeight={600}
          fill={fg}
          textAnchor="end"
          fontFamily="Inter, system-ui, sans-serif"
        >
          {row.label}
        </text>
      ))}

      {/* Grid lines — horizontal */}
      {Array.from({ length: 5 }, (_, i) => (
        <line
          key={`hline-${i}`}
          x1={GRID_LEFT}
          y1={GRID_TOP + i * ROW_HEIGHT}
          x2={GRID_LEFT + GRID_WIDTH}
          y2={GRID_TOP + i * ROW_HEIGHT}
          stroke={grid}
          strokeWidth={i === 0 || i === 4 ? 1.5 : 0.5}
        />
      ))}

      {/* Grid lines — vertical (each hour) */}
      {Array.from({ length: 25 }, (_, i) => (
        <line
          key={`vline-${i}`}
          x1={GRID_LEFT + i * HOUR_WIDTH}
          y1={GRID_TOP}
          x2={GRID_LEFT + i * HOUR_WIDTH}
          y2={GRID_TOP + 4 * ROW_HEIGHT}
          stroke={grid}
          strokeWidth={i % 6 === 0 ? 1 : 0.3}
        />
      ))}

      {/* 15-min tick marks */}
      {Array.from({ length: 96 }, (_, i) => {
        if (i % 4 === 0) return null; // skip full hours
        const x = GRID_LEFT + (i / 4) * HOUR_WIDTH;
        return (
          <line
            key={`tick-${i}`}
            x1={x} y1={GRID_TOP}
            x2={x} y2={GRID_TOP + 4 * ROW_HEIGHT}
            stroke={grid} strokeWidth={0.15} opacity={0.4}
          />
        );
      })}

      {/* Draw duty status lines */}
      {segments.map((seg, i) => {
        const x1 = GRID_LEFT + seg.start * HOUR_WIDTH;
        const x2 = GRID_LEFT + seg.end * HOUR_WIDTH;
        const y  = GRID_TOP + seg.row * ROW_HEIGHT + ROW_HEIGHT / 2;
        return (
          <line
            key={`seg-${i}`}
            x1={x1} y1={y} x2={x2} y2={y}
            stroke={line} strokeWidth={3} strokeLinecap="round"
          />
        );
      })}

      {/* Vertical transition lines between segments */}
      {segments.map((seg, i) => {
        if (i === 0) return null;
        const prev = segments[i - 1];
        if (prev.row === seg.row) return null;
        const x  = GRID_LEFT + seg.start * HOUR_WIDTH;
        const y1 = GRID_TOP + prev.row * ROW_HEIGHT + ROW_HEIGHT / 2;
        const y2 = GRID_TOP + seg.row * ROW_HEIGHT + ROW_HEIGHT / 2;
        return (
          <line
            key={`trans-${i}`}
            x1={x} y1={y1} x2={x} y2={y2}
            stroke={line} strokeWidth={2} strokeLinecap="round"
          />
        );
      })}

      {/* Totals */}
      {totals && (
        <g>
          <text x={14} y={GRID_TOP + 4 * ROW_HEIGHT + 24} fontSize={10} fontWeight={600} fill={fg}
                fontFamily="Inter, system-ui, sans-serif">
            Totals:
          </text>
          <text x={14} y={GRID_TOP + 4 * ROW_HEIGHT + 40} fontSize={9} fill={fg} opacity={0.7}
                fontFamily="Inter, system-ui, sans-serif">
            Off Duty: {totals.off_duty}h  |  Sleeper: {totals.sleeper_berth}h  |  Driving: {totals.driving}h  |  On Duty: {totals.on_duty_not_driving}h
            {'  |  Total: '}
            {(totals.off_duty + totals.sleeper_berth + totals.driving + totals.on_duty_not_driving).toFixed(1)}h
          </text>
        </g>
      )}

      {/* Remarks — show event locations */}
      <text x={14} y={H - 12} fontSize={8} fill={fg} opacity={0.4} fontFamily="Inter, system-ui, sans-serif">
        Remarks: {events.filter(e => e.location).map(e => e.location).join(' → ')}
      </text>
    </svg>
  );
}
