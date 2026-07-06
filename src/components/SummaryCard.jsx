export default function SummaryCard({ label, amount, type = 'neutral', icon, subtitle }) {
  const colors = {
    positive: { amount: 'var(--color-positive)', bg: '#3DDC9715', border: '#3DDC9740' },
    negative: { amount: 'var(--color-negative)', bg: '#FF6B6B15', border: '#FF6B6B40' },
    accent: { amount: 'var(--color-accent)', bg: '#E8A33D15', border: '#E8A33D40' },
    neutral: { amount: 'var(--color-text)', bg: 'var(--color-surface)', border: 'var(--color-border)' },
  };
  const c = colors[type];

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--color-muted)', fontFamily: 'Inter, sans-serif' }}>
          {label}
        </span>
        {icon && <span style={{ color: c.amount }}>{icon}</span>}
      </div>
      <div
        className="text-xl font-semibold"
        style={{ color: c.amount, fontFamily: 'IBM Plex Mono, monospace' }}
      >
        ₹{new Intl.NumberFormat('en-IN').format(Math.abs(amount))}
      </div>
      {subtitle && (
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{subtitle}</p>
      )}
    </div>
  );
}
