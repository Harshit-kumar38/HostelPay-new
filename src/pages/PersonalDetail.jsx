import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { personalStore, userStore } from '../store';
import StampBadge from '../components/StampBadge';
import ExpenseModal from '../components/ExpenseModal';
import { downloadPersonalPDF } from '../utils/export';

export default function PersonalDetail() {
  const { contactId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [contact, setContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const load = async () => {
    const recs = await personalStore.getByContact(user?.id, contactId);
    setRecords(recs);

    if (contactId.startsWith('name:')) {
      // External contact — derive name from the key or the first record
      const name = contactId.slice(5);
      setContact({ name, avatar: name[0]?.toUpperCase() || '?' });
    } else {
      // Registered user — fetch profile
      try {
        const u = await userStore.getById(contactId);
        setContact(u || { name: recs[0]?.to_name || 'Contact', avatar: recs[0]?.to_name?.[0]?.toUpperCase() || '?' });
      } catch {
        setContact({ name: recs[0]?.to_name || 'Contact', avatar: recs[0]?.to_name?.[0]?.toUpperCase() || '?' });
      }
    }
  };

  useEffect(() => { load(); }, [contactId, user]);

  const handleSettle = async (id) => {
    await personalStore.settle(id);
    load();
    showToast('Marked as settled ✓');
  };

  const handleDelete = async (id) => {
    await personalStore.delete(id);
    setDeleteConfirm(null);
    load();
    showToast('Record deleted');
  };

  const handleSettleAll = async () => {
    await personalStore.settleContact(user.id, contactId);
    load();
    showToast('All settled with ' + contact?.name + ' ✓');
  };

  const pending = records.filter(r => r.status === 'pending');
  const net = pending.reduce((sum, r) => {
    if (r.from_user === user?.id && r.type === 'lend') return sum + r.amount;
    if (r.from_user === user?.id && r.type === 'borrow') return sum - r.amount;
    if (r.to_user === user?.id && r.type === 'lend') return sum - r.amount;
    return sum;
  }, 0);

  return (
    <div className="page-container">
      {/* HEADER */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/personal')} style={{ color: 'var(--color-muted)' }} aria-label="Back" id="btn-back-personal">
            <ArrowLeft size={20} />
          </button>
          <div className="avatar-circle">{contact?.avatar || '?'}</div>
          <div className="flex-1">
            <h1 className="text-lg font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>{contact?.name || 'Contact'}</h1>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary py-2 px-3 text-sm" id="btn-add-personal-detail">
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-5">
        {/* Balance card */}
        <div className="rounded-xl p-4" style={{
          background: net === 0 ? 'var(--color-surface)' : net > 0 ? '#3DDC9712' : '#FF6B6B12',
          border: `1px solid ${net === 0 ? 'var(--color-border)' : net > 0 ? '#3DDC9740' : '#FF6B6B40'}`,
        }}>
          <p className="text-xs mb-1" style={{ color: 'var(--color-muted)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px' }}>
            {net > 0 ? `${contact?.name?.toUpperCase()} OWES YOU` : net < 0 ? 'YOU OWE' : 'ALL SETTLED'}
          </p>
          <span className="text-2xl font-bold" style={{ fontFamily: 'IBM Plex Mono, monospace', color: net === 0 ? 'var(--color-muted)' : net > 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}>
            {net === 0 ? '₹0' : `₹${Math.abs(net).toFixed(2)}`}
          </span>
          {net !== 0 && (
            <div className="mt-3 flex gap-2">
              <button onClick={handleSettleAll} className="btn-primary py-2 px-4 text-xs" id="btn-settle-all-personal">
                <Check size={13} /> Mark All Settled
              </button>
              <button onClick={() => downloadPersonalPDF(records, contact)} className="btn-secondary py-2 px-4 text-xs" id="btn-personal-pdf">
                📄 PDF
              </button>
            </div>
          )}
        </div>

        {/* Records */}
        {records.length === 0 ? (
          <div className="text-center py-10" style={{ color: 'var(--color-muted)' }}>
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm">No records yet</p>
          </div>
        ) : (
          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>History</h2>
            <div className="surface-card overflow-hidden">
              <div className="passbook-top-border" />
              {records.map(r => {
                const iLent = r.from_user === user?.id && r.type === 'lend';
                const netAmt = iLent ? r.amount : -r.amount;

                return (
                  <div key={r.id}>
                    <div className="passbook-row">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{r.description}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                          {iLent ? `You lent to ${contact?.name}` : `${contact?.name} lent you`}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px' }}>
                          {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(r.created_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-sm font-bold block" style={{ fontFamily: 'IBM Plex Mono, monospace', color: netAmt > 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}>
                            {netAmt > 0 ? '+' : ''}₹{Math.abs(netAmt).toFixed(2)}
                          </span>
                        </div>
                        <StampBadge
                          status={r.status}
                          onSettle={r.status === 'pending' ? () => handleSettle(r.id) : undefined}
                          size="sm"
                        />
                        <button onClick={() => setDeleteConfirm(r.id)} className="p-1" style={{ color: 'var(--color-muted)' }} aria-label="Delete record" id={`btn-delete-personal-${r.id}`}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    {deleteConfirm === r.id && (
                      <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#FF6B6B12', borderBottom: '1px solid var(--color-border)' }}>
                        <p className="text-xs" style={{ color: 'var(--color-negative)' }}>Delete this record?</p>
                        <div className="flex gap-2">
                          <button onClick={() => handleDelete(r.id)} className="btn-danger py-1 px-3 text-xs" id={`btn-confirm-delete-personal-${r.id}`}>Delete</button>
                          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary py-1 px-3 text-xs">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bottom-nav-spacer" />
      </div>

      {showModal && <ExpenseModal onClose={() => setShowModal(false)} onSave={load} defaultType="personal" />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
