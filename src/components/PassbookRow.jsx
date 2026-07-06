import StampBadge from './StampBadge';

function formatDate(iso) {
  const d = new Date(iso);
  const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined });
  const timeStr = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${dateStr}, ${timeStr}`;
}

function formatAmount(amount) {
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Math.abs(amount));
}

export default function PassbookRow({
  description,
  subtext,
  amount,        // positive = owed to user, negative = user owes
  date,
  status,        // 'pending' | 'settled' | undefined (no stamp)
  onSettle,
  onClick,
  showStamp = false,
  icon,
}) {
  const isPositive = amount > 0;
  const isNegative = amount < 0;

  return (
    <div
      className={`passbook-row ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {/* Left: icon or avatar */}
      {icon && (
        <div className="flex-shrink-0">{icon}</div>
      )}

      {/* Center: description + subtext */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
          {description}
        </p>
        {subtext && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-muted)' }}>
            {subtext}
          </p>
        )}
        {date && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px' }}>
            {formatDate(date)}
          </p>
        )}
      </div>

      {/* Right: amount */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          {amount !== undefined && (
            <span
              className="font-mono text-sm font-semibold"
              style={{
                color: isPositive ? 'var(--color-positive)' : isNegative ? 'var(--color-negative)' : 'var(--color-muted)',
                fontFamily: 'IBM Plex Mono, monospace',
              }}
            >
              {isPositive ? '+' : isNegative ? '-' : ''}₹{formatAmount(amount)}
            </span>
          )}
          {status && !showStamp && (
            <p className="text-xs mt-0.5" style={{ color: status === 'settled' ? 'var(--color-muted)' : 'var(--color-accent)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px' }}>
              {status.toUpperCase()}
            </p>
          )}
        </div>

        {/* Stamp badge */}
        {showStamp && status && (
          <StampBadge status={status} onSettle={onSettle} size="sm" />
        )}
      </div>
    </div>
  );
}
