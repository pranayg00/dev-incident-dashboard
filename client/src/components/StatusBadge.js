import React from 'react';

const configs = {
  UP: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', label: 'Operational' },
  DOWN: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', label: 'Down' },
  DEGRADED: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: 'Degraded' },
  UNKNOWN: { color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)', label: 'Unknown' },
  OPEN: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', label: 'Open' },
  INVESTIGATING: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: 'Investigating' },
  RESOLVED: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', label: 'Resolved' },
  HIGH: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: 'High' },
  CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', label: 'Critical' },
  LOW: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', label: 'Low' },
  MEDIUM: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: 'Medium' },
};

const StatusBadge = ({ status, pulse = false }) => {
  const config = configs[status] || configs.UNKNOWN;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{ color: config.color, background: config.bg, border: `1px solid ${config.border}` }}
    >
      <span className="relative flex h-2 w-2">
        {pulse && status === 'DOWN' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ background: config.color }} />
        )}
        <span className="relative inline-flex rounded-full h-2 w-2"
          style={{ background: config.color }} />
      </span>
      {config.label}
    </span>
  );
};

export default StatusBadge;