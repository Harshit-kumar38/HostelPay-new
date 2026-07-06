import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Copy, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { groupStore, balanceStore } from '../store';
import ExpenseModal from '../components/ExpenseModal';

function CreateGroupModal({ onClose, onCreated, userId }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Enter a group name.'); return; }
    setLoading(true);
    try {
      const group = await groupStore.create(name.trim(), userId);
      onCreated(group);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <h2 className="text-lg font-semibold mb-5" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>Create Group</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>GROUP NAME</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Room 214 — Hostel B" className="hp-input" id="input-create-group-name" autoFocus required />
          </div>
          {error && <p className="text-sm" style={{ color: 'var(--color-negative)' }}>{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary justify-center w-full py-3" id="btn-confirm-create-group">{loading ? 'Creating…' : 'Create Group'}</button>
          <button type="button" onClick={onClose} className="btn-secondary justify-center w-full py-2.5" id="btn-cancel-create-group">Cancel</button>
        </form>
      </div>
    </div>
  );
}

function JoinGroupModal({ onClose, onJoined, userId }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) { setError('Enter a room code.'); return; }
    setLoading(true);
    try {
      const group = await groupStore.join(code.trim(), userId);
      onJoined(group);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <h2 className="text-lg font-semibold mb-5" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>Join a Group</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>ROOM CODE</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              className="hp-input text-center text-xl tracking-widest"
              style={{ fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.2em' }}
              id="input-join-room-code"
              maxLength={8}
              autoFocus
              required
            />
          </div>
          {error && <p className="text-sm" style={{ color: 'var(--color-negative)' }}>{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary justify-center w-full py-3" id="btn-confirm-join-group">{loading ? 'Joining…' : 'Join Group'}</button>
          <button type="button" onClick={onClose} className="btn-secondary justify-center w-full py-2.5" id="btn-cancel-join-group">Cancel</button>
        </form>
      </div>
    </div>
  );
}

function GroupCreatedModal({ group, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(group.room_code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="modal-overlay">
      <div className="modal-content text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h2 className="text-lg font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>Group Created!</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--color-muted)' }}>Share this code with your roommates to join:</p>
        <div className="room-code mb-4">{group.room_code}</div>
        <p className="text-xs mb-6" style={{ color: 'var(--color-muted)', fontFamily: 'IBM Plex Mono, monospace' }}>{group.name}</p>
        <button onClick={copy} className="btn-primary w-full justify-center mb-3" id="btn-copy-room-code">
          <Copy size={15} /> {copied ? 'Copied!' : 'Copy Code'}
        </button>
        <button onClick={onClose} className="btn-secondary w-full justify-center" id="btn-close-created-modal">Done</button>
      </div>
    </div>
  );
}

export default function Groups() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [groupNets, setGroupNets] = useState({});
  const [modal, setModal] = useState(null);
  const [createdGroup, setCreatedGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const gs = await groupStore.getUserGroups(user.id);
    setGroups(gs);
    // Fetch nets in parallel
    const nets = await Promise.all(gs.map(g => balanceStore.getGroupNetForUser(g.id, user.id)));
    const netMap = {};
    gs.forEach((g, i) => { netMap[g.id] = nets[i]; });
    setGroupNets(netMap);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleCreated = (group) => { setCreatedGroup(group); setModal('created'); load(); };
  const handleJoined = (group) => { load(); navigate(`/groups/${group.id}`); };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>Groups</h1>
          <div className="flex gap-2">
            <button onClick={() => setModal('join')} className="btn-secondary py-2 px-3 text-sm" id="btn-join-group">Join</button>
            <button onClick={() => setModal('create')} className="btn-primary py-2 px-3 text-sm" id="btn-create-group">
              <Plus size={15} /> Create
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-base font-semibold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>No groups yet</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>Create a group for your hostel room or join one with a code.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setModal('create')} className="btn-primary" id="btn-empty-create-group">
                <Plus size={16} /> Create Group
              </button>
              <button onClick={() => setModal('join')} className="btn-secondary" id="btn-empty-join-group">Join with Code</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {groups.map(g => {
              const net = groupNets[g.id] || 0;
              return (
                <button
                  key={g.id}
                  onClick={() => navigate(`/groups/${g.id}`)}
                  className="surface-card p-4 text-left w-full flex items-center gap-4 transition-colors hover:border-accent"
                  id={`btn-group-${g.id}`}
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="avatar-circle w-12 h-12 text-lg rounded-xl flex-shrink-0">🏠</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>{g.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px' }}>
                      CODE: {g.room_code}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className="text-sm font-bold"
                      style={{ fontFamily: 'IBM Plex Mono, monospace', color: net === 0 ? 'var(--color-muted)' : net > 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}
                    >
                      {net === 0 ? '–' : `${net > 0 ? '+' : ''}₹${Math.abs(net).toFixed(0)}`}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      {net === 0 ? 'Settled' : net > 0 ? 'Owed to you' : 'You owe'}
                    </p>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--color-muted)', flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        )}
        <div className="bottom-nav-spacer" />
      </div>

      {modal === 'create' && <CreateGroupModal onClose={() => setModal(null)} onCreated={handleCreated} userId={user?.id} />}
      {modal === 'join' && <JoinGroupModal onClose={() => setModal(null)} onJoined={handleJoined} userId={user?.id} />}
      {modal === 'created' && createdGroup && <GroupCreatedModal group={createdGroup} onClose={() => { setModal(null); navigate(`/groups/${createdGroup.id}`); }} />}
    </div>
  );
}
