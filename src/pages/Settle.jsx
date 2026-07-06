import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPendingItems, personalStore } from '../store';
import StampBadge from '../components/StampBadge';
import { generateSettleMessage, whatsappUrl } from '../utils/share';

function SettleModal({ item, onClose, onSettled }) {
  const { user } = useAuth();
  const [settled, setSettled] = useState(false);
  const [copied, setCopied] = useState(false);

  const name = item.type === 'personal' ? item.user?.name : item.group?.name;
  const amount = Math.abs(item.net);
  const iOweThem = item.net < 0;
  const message = generateSettleMessage(name, amount, iOweThem, user?.name);
  const waUrl = whatsappUrl(message);

  const handleSettle = async () => {
    if (item.type === 'personal') {
      await personalStore.settleContact(user.id, item.user?.id);
    }
    setSettled(true);
    onSettled();
  };

  const copyMsg = () => { navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        {!settled ? (
          <>
            <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>Settle Up</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--color-muted)' }}>
              {iOweThem ? `You owe ${name}` : `${name} owes you`}{' '}
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', color: iOweThem ? 'var(--color-negative)' : 'var(--color-positive)', fontWeight: 600 }}>
                ₹{amount.toFixed(2)}
              </span>
            </p>

            <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <p className="text-xs mb-2" style={{ color: 'var(--color-muted)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px' }}>SHARE MESSAGE</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)', fontStyle: 'italic' }}>"{message}"</p>
            </div>

            <div className="flex gap-2 mb-5">
              <button onClick={copyMsg} className="btn-secondary flex-1 py-2.5 text-sm" id="btn-copy-settle-msg">
                <Copy size={14} /> {copied ? 'Copied!' : 'Copy'}
              </button>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 py-2.5 text-sm text-center no-underline flex items-center justify-center gap-2" id="btn-whatsapp-share">
                <ExternalLink size={14} /> WhatsApp
              </a>
            </div>

            <button onClick={handleSettle} className="btn-primary w-full py-3 justify-center" id="btn-confirm-settle">
              <Check size={16} /> Mark as Settled
            </button>
            <button onClick={onClose} className="btn-secondary w-full py-2.5 mt-2 justify-center" id="btn-cancel-settle">Cancel</button>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="flex justify-center mb-4">
              <StampBadge status="settled" size="lg" />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>Settled! ✓</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--color-muted)' }}>Transaction marked as settled.</p>
            <button onClick={onClose} className="btn-primary w-full justify-center py-3" id="btn-settled-done">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Settle() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [settleItem, setSettleItem] = useState(null);
  const [sort, setSort] = useState('amount');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const pending = await getPendingItems(user.id);
    setItems(pending);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const sorted = [...items].sort((a, b) => {
    if (sort === 'amount') return Math.abs(b.net) - Math.abs(a.net);
    return 0;
  });

  const totalOwe = items.filter(i => i.net < 0).reduce((s, i) => s + Math.abs(i.net), 0);
  const totalOwed = items.filter(i => i.net > 0).reduce((s, i) => s + i.net, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>Settle Up</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>All pending payments</p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setSort('amount')} className={`tab-btn ${sort === 'amount' ? 'active' : ''}`} id="btn-sort-amount">By Amount</button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {items.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ background: '#FF6B6B15', border: '1px solid #FF6B6B40' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--color-muted)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px' }}>YOU OWE</p>
                  <span className="text-xl font-bold" style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--color-negative)' }}>₹{totalOwe.toFixed(0)}</span>
                </div>
                <div className="rounded-xl p-3" style={{ background: '#3DDC9715', border: '1px solid #3DDC9740' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--color-muted)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px' }}>OWED TO YOU</p>
                  <span className="text-xl font-bold" style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--color-positive)' }}>₹{totalOwed.toFixed(0)}</span>
                </div>
              </div>
            )}

            {sorted.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-base font-semibold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>All cleared!</h3>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No pending payments. You're all settled up.</p>
              </div>
            ) : (
              <div>
                <h2 className="text-sm font-semibold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>
                  Pending ({sorted.length})
                </h2>
                <div className="surface-card overflow-hidden">
                  <div className="passbook-top-border" />
                  {sorted.map((item, i) => {
                    const name = item.type === 'personal' ? item.user?.name : item.group?.name;
                    const iOwe = item.net < 0;
                    return (
                      <div key={i} className="passbook-row">
                        <div className="avatar-circle">{item.type === 'personal' ? (item.user?.avatar || '?') : '🏠'}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{name}</p>
                          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                            {iOwe ? `You owe ${name}` : `${name} owes you`} · {item.type}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-sm font-bold block" style={{ fontFamily: 'IBM Plex Mono, monospace', color: iOwe ? 'var(--color-negative)' : 'var(--color-positive)' }}>
                              {iOwe ? '-' : '+'}₹{Math.abs(item.net).toFixed(2)}
                            </span>
                          </div>
                          <button
                            onClick={() => setSettleItem(item)}
                            className="btn-primary py-1.5 px-3 text-xs flex-shrink-0"
                            id={`btn-settle-item-${i}`}
                          >
                            Settle
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <div className="bottom-nav-spacer" />
      </div>

      {settleItem && (
        <SettleModal
          item={settleItem}
          onClose={() => setSettleItem(null)}
          onSettled={load}
        />
      )}
    </div>
  );
}
