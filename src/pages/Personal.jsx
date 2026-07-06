import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { personalStore, balanceStore } from '../store';
import ExpenseModal from '../components/ExpenseModal';

export default function Personal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const balances = await balanceStore.getPersonalBalances(user.id);
    setContacts(balances);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>Personal</h1>
          <button onClick={() => setShowModal(true)} className="btn-primary py-2 px-3 text-sm" id="btn-add-personal">
            <Plus size={15} /> Add
          </button>
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>One-on-one borrow & lend records</p>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-base font-semibold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>No personal records</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>Track one-on-one borrows and lends with friends.</p>
            <button onClick={() => setShowModal(true)} className="btn-primary" id="btn-empty-add-personal">
              <Plus size={16} /> Add Record
            </button>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="flex gap-3 mb-5">
              <div className="flex-1 rounded-xl p-3" style={{ background: '#3DDC9715', border: '1px solid #3DDC9740' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--color-muted)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px' }}>OWED TO YOU</p>
                <span className="text-lg font-bold" style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--color-positive)' }}>
                  ₹{contacts.filter(c => c.net > 0).reduce((s, c) => s + c.net, 0).toFixed(0)}
                </span>
              </div>
              <div className="flex-1 rounded-xl p-3" style={{ background: '#FF6B6B15', border: '1px solid #FF6B6B40' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--color-muted)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px' }}>YOU OWE</p>
                <span className="text-lg font-bold" style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--color-negative)' }}>
                  ₹{Math.abs(contacts.filter(c => c.net < 0).reduce((s, c) => s + c.net, 0)).toFixed(0)}
                </span>
              </div>
            </div>

            <div className="surface-card overflow-hidden">
              <div className="passbook-top-border" />
              {contacts.map(c => (
                <div
                  key={c.user?.id}
                  className="passbook-row cursor-pointer"
                  onClick={() => navigate(`/personal/${c.user?.id}`)}
                  role="button"
                  id={`btn-personal-${c.user?.id}`}
                >
                  <div className="avatar-circle">{c.user?.avatar || '?'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{c.user?.name || 'Unknown'}</p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      {c.net > 0 ? 'Owes you' : 'You owe'}
                    </p>
                    {c.lastActivity && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px' }}>
                        {new Date(c.lastActivity).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, {new Date(c.lastActivity).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ fontFamily: 'IBM Plex Mono, monospace', color: c.net > 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}>
                      {c.net > 0 ? '+' : ''}₹{Math.abs(c.net).toFixed(2)}
                    </span>
                    <ChevronRight size={14} style={{ color: 'var(--color-muted)' }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="bottom-nav-spacer" />
      </div>

      {showModal && <ExpenseModal onClose={() => setShowModal(false)} onSave={load} defaultType="personal" />}
    </div>
  );
}
