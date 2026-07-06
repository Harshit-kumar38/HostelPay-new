import { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { expenseStore, memberStore, groupStore, personalStore } from '../store';
import { useAuth } from '../contexts/AuthContext';

export default function ExpenseModal({ onClose, onSave, defaultGroupId, defaultType = 'group' }) {
  const { user } = useAuth();
  const [type, setType] = useState(defaultType);
  const [groupId, setGroupId] = useState(defaultGroupId || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState(user?.id || '');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [contactName, setContactName] = useState('');
  const [personalType, setPersonalType] = useState('lend');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);

  // Load groups on mount
  useEffect(() => {
    if (user) groupStore.getUserGroups(user.id).then(setGroups);
  }, [user]);

  // Load members when groupId changes
  useEffect(() => {
    if (groupId) {
      memberStore.getGroupMembers(groupId).then(mems => {
        setMembers(mems);
        setSelectedMembers(mems.map(m => m.user_id));
        setPaidBy(user?.id);
      });
    } else {
      setMembers([]);
    }
  }, [groupId]);

  // When group changes
  const handleGroupChange = (gid) => {
    setGroupId(gid);
  };

  const toggleMember = (uid) => {
    setSelectedMembers(prev => prev.includes(uid) ? prev.filter(x => x !== uid) : [...prev, uid]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!amount || parseFloat(amount) <= 0) { setError('Enter a valid amount.'); return; }
    if (!description.trim()) { setError('Add a description.'); return; }

    setLoading(true);
    try {
      if (type === 'group') {
        if (!groupId) { setError('Select a group.'); setLoading(false); return; }
        if (selectedMembers.length === 0) { setError('Select at least one member to split with.'); setLoading(false); return; }
        await expenseStore.add(groupId, paidBy, parseFloat(amount), description.trim(), selectedMembers);
      } else {
        if (!contactName.trim()) { setError('Enter the contact\'s name.'); setLoading(false); return; }
        const contactId = 'contact_' + contactName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
        await personalStore.add(user.id, contactId, contactName.trim(), parseFloat(amount), personalType, description.trim());
      }
      onSave?.();
      onClose();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>
            Add Entry
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg" style={{ color: 'var(--color-muted)' }} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Type selector */}
        <div className="flex gap-2 mb-5 p-1 rounded-lg" style={{ background: 'var(--color-bg)' }}>
          <button
            onClick={() => setType('group')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors`}
            style={{
              background: type === 'group' ? 'var(--color-accent)' : 'transparent',
              color: type === 'group' ? '#14151F' : 'var(--color-muted)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Group Expense
          </button>
          <button
            onClick={() => setType('personal')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors`}
            style={{
              background: type === 'personal' ? 'var(--color-accent)' : 'transparent',
              color: type === 'personal' ? '#14151F' : 'var(--color-muted)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Personal
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Amount — big and prominent */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>AMOUNT (₹)</label>
            <div
              className="amount-input-group"
              style={{
                display: 'flex',
                alignItems: 'stretch',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
              onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
              onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              {/* ₹ prefix tile — completely separate from input */}
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--color-accent)',
                  borderRight: '1px solid var(--color-border)',
                  flexShrink: 0,
                  userSelect: 'none',
                }}
              >₹</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  padding: '12px 14px',
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--color-accent)',
                  width: '100%',
                }}
                autoFocus
                id="input-expense-amount"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>DESCRIPTION</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Electricity bill, groceries..."
              className="hp-input"
              id="input-expense-description"
              maxLength={80}
              required
            />
          </div>


          {type === 'group' ? (
            <>
              {/* Group selector */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>GROUP</label>
                <select
                  className="hp-input"
                  value={groupId}
                  onChange={e => handleGroupChange(e.target.value)}
                  id="select-expense-group"
                  required
                >
                  <option value="">Select group…</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>

              {/* Paid by */}
              {members.length > 0 && (
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>PAID BY</label>
                  <select
                    className="hp-input"
                    value={paidBy}
                    onChange={e => setPaidBy(e.target.value)}
                    id="select-expense-paidby"
                  >
                    {members.map(m => <option key={m.user_id} value={m.user_id}>{m.user?.name}{m.user_id === user?.id ? ' (You)' : ''}</option>)}
                  </select>
                </div>
              )}

              {/* Split between */}
              {members.length > 0 && (
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-muted)' }}>SPLIT BETWEEN</label>
                  <div className="flex flex-wrap gap-2">
                    {members.map(m => (
                      <button
                        key={m.user_id}
                        type="button"
                        onClick={() => toggleMember(m.user_id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                        style={{
                          background: selectedMembers.includes(m.user_id) ? 'var(--color-accent)25' : 'var(--color-bg)',
                          border: `1px solid ${selectedMembers.includes(m.user_id) ? 'var(--color-accent)' : 'var(--color-border)'}`,
                          color: selectedMembers.includes(m.user_id) ? 'var(--color-accent)' : 'var(--color-muted)',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        {m.user?.name}{m.user_id === user?.id ? ' (You)' : ''}
                      </button>
                    ))}
                  </div>
                  {selectedMembers.length > 0 && amount && (
                    <p className="text-xs mt-2" style={{ color: 'var(--color-muted)', fontFamily: 'IBM Plex Mono, monospace' }}>
                      Each pays ₹{(parseFloat(amount || 0) / selectedMembers.length).toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Personal type */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-muted)' }}>TYPE</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPersonalType('lend')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: personalType === 'lend' ? '#3DDC9720' : 'var(--color-bg)',
                      border: `1px solid ${personalType === 'lend' ? 'var(--color-positive)' : 'var(--color-border)'}`,
                      color: personalType === 'lend' ? 'var(--color-positive)' : 'var(--color-muted)',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    <Plus size={14} /> I Lent
                  </button>
                  <button
                    type="button"
                    onClick={() => setPersonalType('borrow')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: personalType === 'borrow' ? '#FF6B6B20' : 'var(--color-bg)',
                      border: `1px solid ${personalType === 'borrow' ? 'var(--color-negative)' : 'var(--color-border)'}`,
                      color: personalType === 'borrow' ? 'var(--color-negative)' : 'var(--color-muted)',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    <Minus size={14} /> I Borrowed
                  </button>
                </div>
              </div>

              {/* Contact name */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                  {personalType === 'lend' ? 'LENT TO' : 'BORROWED FROM'}
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Person's name"
                  className="hp-input"
                  id="input-personal-contact"
                  required
                />
              </div>
            </>
          )}

          {error && (
            <p className="text-sm" style={{ color: 'var(--color-negative)' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary justify-center w-full py-3 text-base"
            id="btn-submit-expense"
          >
            {loading ? 'Saving…' : '✓ Save Entry'}
          </button>
        </form>
      </div>
    </div>
  );
}
