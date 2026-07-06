import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Copy, Trash2, Edit2, Users, X, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { groupStore, memberStore, expenseStore, balanceStore } from '../store';
import PassbookRow from '../components/PassbookRow';
import ExpenseModal from '../components/ExpenseModal';
import { downloadGroupPDF, downloadGroupCSV } from '../utils/export';

function EditExpenseModal({ expense, onClose, onSave }) {
  const [amount, setAmount] = useState(String(expense.amount));
  const [description, setDescription] = useState(expense.description);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) { setError('Enter a valid amount.'); return; }
    setLoading(true);
    try {
      await expenseStore.update(expense.id, { amount: parseFloat(amount), description });
      onSave();
      onClose();
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <h2 className="text-lg font-semibold mb-5" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>Edit Expense</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>AMOUNT (₹)</label>
            <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="hp-input text-lg" style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--color-accent)' }} autoFocus id="input-edit-amount" required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>DESCRIPTION</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="hp-input" id="input-edit-description" maxLength={80} required />
          </div>
          {error && <p className="text-sm" style={{ color: 'var(--color-negative)' }}>{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary justify-center w-full py-3" id="btn-confirm-edit-expense">{loading ? 'Saving…' : 'Save Changes'}</button>
          <button type="button" onClick={onClose} className="btn-secondary justify-center w-full py-2.5">Cancel</button>
        </form>
      </div>
    </div>
  );
}

export default function GroupDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filterMember, setFilterMember] = useState('all');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const load = async () => {
    const [g, mems, exps, bals] = await Promise.all([
      groupStore.getById(id),
      memberStore.getGroupMembers(id),
      expenseStore.getGroupExpenses(id),
      balanceStore.getGroupBalances(id, user?.id),
    ]);
    if (!g) { navigate('/groups'); return; }
    setGroup(g);
    setMembers(mems);
    setExpenses(exps);
    setBalances(bals);
  };

  useEffect(() => { load(); }, [id]);

  const handleDelete = async (expId) => {
    await expenseStore.delete(expId);
    setDeleteConfirm(null);
    load();
    showToast('Expense deleted');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(group?.room_code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const removeMember = async (uid) => {
    await memberStore.removeMember(id, uid);
    load();
    showToast('Member removed');
  };

  const filteredExpenses = filterMember === 'all' ? expenses : expenses.filter(e => e.paid_by === filterMember || e.splits?.some(s => s.user_id === filterMember));
  const canEdit = (expense) => expense.paid_by === user?.id || group?.created_by === user?.id;

  if (!group) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-7 h-7 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
    </div>
  );

  const myBalance = balances.find(b => b.user?.id === user?.id);
  const myNet = myBalance?.net || 0;

  return (
    <div className="page-container">
      {/* HEADER */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/groups')} className="p-1" style={{ color: 'var(--color-muted)' }} aria-label="Back" id="btn-back-groups">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>{group.name}</h1>
            <button onClick={copyCode} className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-muted)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px' }} id="btn-copy-code-header">
              CODE: {group.room_code} <Copy size={10} /> {copied && '✓'}
            </button>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary py-2 px-3 text-sm flex-shrink-0" id="btn-groupdetail-add">
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-5">
        {/* MY BALANCE */}
        <div
          className="rounded-xl p-4"
          style={{
            background: myNet === 0 ? 'var(--color-surface)' : myNet > 0 ? '#3DDC9712' : '#FF6B6B12',
            border: `1px solid ${myNet === 0 ? 'var(--color-border)' : myNet > 0 ? '#3DDC9740' : '#FF6B6B40'}`,
          }}
        >
          <p className="text-xs mb-1" style={{ color: 'var(--color-muted)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px' }}>YOUR BALANCE IN THIS GROUP</p>
          <span className="text-2xl font-bold" style={{ fontFamily: 'IBM Plex Mono, monospace', color: myNet === 0 ? 'var(--color-muted)' : myNet > 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}>
            {myNet === 0 ? '₹0' : `${myNet > 0 ? '+' : ''}₹${Math.abs(myNet).toFixed(2)}`}
          </span>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
            {myNet === 0 ? 'All settled up!' : myNet > 0 ? 'Others owe you' : 'You owe the group'}
          </p>
        </div>

        {/* MEMBER BALANCES */}
        <div>
          <button onClick={() => setShowMembers(v => !v)} className="flex items-center justify-between w-full mb-2" id="btn-toggle-members">
            <h2 className="text-sm font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>
              <Users size={14} className="inline mr-2" style={{ color: 'var(--color-muted)' }} />
              Members ({members.length})
            </h2>
            <span className="text-xs" style={{ color: 'var(--color-accent)' }}>{showMembers ? 'Hide' : 'Show'}</span>
          </button>

          {showMembers && (
            <div className="surface-card overflow-hidden">
              {members.map(m => {
                const bal = balances.find(b => b.user?.id === m.user_id);
                const net = bal?.net || 0;
                return (
                  <div key={m.user_id} className="passbook-row">
                    <div className="avatar-circle">{m.user?.avatar || '?'}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {m.user?.name}{m.user_id === user?.id ? ' (You)' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ fontFamily: 'IBM Plex Mono, monospace', color: net === 0 ? 'var(--color-muted)' : net > 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}>
                        {net === 0 ? '–' : `${net > 0 ? '+' : ''}₹${Math.abs(net).toFixed(0)}`}
                      </span>
                      {group.created_by === user?.id && m.user_id !== user?.id && (
                        <button onClick={() => removeMember(m.user_id)} className="p-1 rounded" style={{ color: 'var(--color-muted)' }} aria-label="Remove member" id={`btn-remove-member-${m.user_id}`}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* EXPORT */}
        <div className="flex gap-2">
          <button onClick={() => downloadGroupPDF(expenses, group, members)} className="btn-secondary flex-1 py-2 text-xs" id="btn-export-pdf">📄 Download PDF</button>
          <button onClick={() => downloadGroupCSV(expenses, group)} className="btn-secondary flex-1 py-2 text-xs" id="btn-export-csv">📊 Download CSV</button>
        </div>

        {/* EXPENSE HISTORY */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>
              Expenses ({expenses.length})
            </h2>
          </div>

          {members.length > 1 && (
            <div className="flex gap-1.5 flex-wrap mb-3">
              <button onClick={() => setFilterMember('all')} className={`tab-btn ${filterMember === 'all' ? 'active' : ''}`} id="btn-filter-all">All</button>
              {members.map(m => (
                <button key={m.user_id} onClick={() => setFilterMember(m.user_id)} className={`tab-btn ${filterMember === m.user_id ? 'active' : ''}`} id={`btn-filter-${m.user_id}`}>
                  {m.user?.name?.split(' ')[0]}{m.user_id === user?.id ? ' (You)' : ''}
                </button>
              ))}
            </div>
          )}

          {filteredExpenses.length === 0 ? (
            <div className="text-center py-10" style={{ color: 'var(--color-muted)' }}>
              <div className="text-3xl mb-2">📭</div>
              <p className="text-sm">No expenses yet. Add the first one!</p>
            </div>
          ) : (
            <div className="surface-card overflow-hidden">
              <div className="passbook-top-border" />
              {filteredExpenses.map(e => {
                const myShare = e.splits?.find(s => s.user_id === user?.id)?.share_amount || 0;
                const iPaid = e.paid_by === user?.id;
                const net = iPaid ? (e.amount - myShare) : -myShare;

                return (
                  <div key={e.id}>
                    <div className="passbook-row relative group">
                      <div className="avatar-circle flex-shrink-0">{e.payer?.avatar || '?'}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{e.description}</p>
                        <p className="text-xs" style={{ color: 'var(--color-muted)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px' }}>
                          {e.payer?.name}{iPaid ? ' (You)' : ''} paid · {new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, {new Date(e.created_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-semibold block" style={{ fontFamily: 'IBM Plex Mono, monospace', color: net > 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}>
                          {net > 0 ? '+' : ''}₹{Math.abs(net).toFixed(2)}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-muted)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px' }}>
                          ₹{e.amount.toFixed(2)} total
                        </span>
                      </div>
                      {canEdit(e) && (
                        <div className="flex gap-1 ml-2 flex-shrink-0">
                          <button onClick={() => setEditExpense(e)} className="p-1.5 rounded" style={{ color: 'var(--color-muted)' }} aria-label="Edit expense" id={`btn-edit-${e.id}`}>
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => setDeleteConfirm(e.id)} className="p-1.5 rounded" style={{ color: 'var(--color-negative)' }} aria-label="Delete expense" id={`btn-delete-${e.id}`}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                    {deleteConfirm === e.id && (
                      <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#FF6B6B12', borderBottom: '1px solid var(--color-border)' }}>
                        <p className="text-xs" style={{ color: 'var(--color-negative)' }}>Delete this expense?</p>
                        <div className="flex gap-2">
                          <button onClick={() => handleDelete(e.id)} className="btn-danger py-1 px-3 text-xs" id={`btn-confirm-delete-${e.id}`}>Delete</button>
                          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary py-1 px-3 text-xs" id={`btn-cancel-delete-${e.id}`}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bottom-nav-spacer" />
      </div>

      {showAddModal && <ExpenseModal onClose={() => setShowAddModal(false)} onSave={load} defaultGroupId={id} defaultType="group" />}
      {editExpense && <EditExpenseModal expense={editExpense} onClose={() => setEditExpense(null)} onSave={load} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
