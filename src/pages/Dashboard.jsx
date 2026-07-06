import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingDown, TrendingUp, Receipt, Plus, ChevronRight, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { balanceStore, groupStore, expenseStore } from '../store';
import SummaryCard from '../components/SummaryCard';
import PassbookRow from '../components/PassbookRow';
import ExpenseModal from '../components/ExpenseModal';

function formatAmt(v) { return new Intl.NumberFormat('en-IN').format(Math.abs(v)); }

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState(null);

  const load = async () => {
    if (!user) return;
    const [{ totalOwe, totalOwed }, monthly, groups, personal, recent] = await Promise.all([
      balanceStore.getTotals(user.id),
      balanceStore.getMonthlyTotal(user.id),
      groupStore.getUserGroups(user.id),
      balanceStore.getPersonalBalances(user.id),
      expenseStore.getRecentAll(user.id, 8),
    ]);

    // Get net for each group
    const groupsWithNet = await Promise.all(
      groups.map(async g => ({ ...g, net: await balanceStore.getGroupNetForUser(g.id, user.id) }))
    );

    setData({ totalOwe, totalOwed, monthly, groups: groupsWithNet, personal, recent });
  };

  useEffect(() => { load(); }, [user]);

  if (!data) return (
    <div className="flex items-center justify-center h-screen" style={{ color: 'var(--color-muted)' }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 rounded-full border-t-transparent animate-spin mx-auto mb-3" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
        <p className="text-sm">Loading ledger…</p>
      </div>
    </div>
  );

  const netBalance = data.totalOwed - data.totalOwe;

  return (
    <div className="page-container">
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs mb-0.5" style={{ color: 'var(--color-muted)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px' }}>
              NIGHT LEDGER
            </p>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>
              Hey, {user?.name?.split(' ')[0]} 👋
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 rounded-lg"
              style={{ color: 'var(--color-muted)', background: 'var(--color-surface)' }}
              id="btn-dashboard-theme"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="p-2 rounded-lg md:hidden"
              style={{ color: 'var(--color-muted)', background: 'var(--color-surface)' }}
              id="btn-dashboard-logout"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary py-2 px-3 text-sm"
              id="btn-dashboard-add"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-5">
        {/* ===== NET BALANCE BANNER ===== */}
        <div
          className="rounded-xl p-5"
          style={{
            background: netBalance >= 0 ? '#3DDC9712' : '#FF6B6B12',
            border: `1px solid ${netBalance >= 0 ? '#3DDC9740' : '#FF6B6B40'}`,
          }}
        >
          <p className="text-xs mb-1" style={{ color: 'var(--color-muted)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px' }}>
            {netBalance >= 0 ? 'OVERALL — OTHERS OWE YOU' : 'OVERALL — YOU OWE'}
          </p>
          <span
            className="text-3xl font-bold"
            style={{ fontFamily: 'IBM Plex Mono, monospace', color: netBalance >= 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}
          >
            ₹{formatAmt(netBalance)}
          </span>
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* ===== SUMMARY CARDS ===== */}
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard label="You Owe" amount={data.totalOwe} type="negative" icon={<TrendingDown size={16} />} subtitle="Across all groups & personal" />
          <SummaryCard label="Owed to You" amount={data.totalOwed} type="positive" icon={<TrendingUp size={16} />} subtitle="Across all groups & personal" />
          <SummaryCard label="This Month" amount={data.monthly} type="accent" icon={<Receipt size={16} />} subtitle="Total group expenses" />
          <SummaryCard label="Active Groups" amount={data.groups.length} type="neutral" subtitle="Groups you're part of" />
        </div>

        {/* ===== GROUP BALANCES ===== */}
        {data.groups.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-sm font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>
                Group Balances
              </h2>
              <button onClick={() => navigate('/groups')} className="text-xs" style={{ color: 'var(--color-accent)' }} id="btn-see-all-groups">
                See all →
              </button>
            </div>
            <div className="surface-card overflow-hidden">
              <div className="passbook-top-border" />
              {data.groups.map(g => (
                <PassbookRow
                  key={g.id}
                  description={g.name}
                  subtext={g.net === 0 ? 'All settled' : g.net > 0 ? 'Others owe you' : 'You owe'}
                  amount={g.net}
                  onClick={() => navigate(`/groups/${g.id}`)}
                  icon={<div className="avatar-circle text-xs" style={{ width: 32, height: 32 }}>🏠</div>}
                />
              ))}
            </div>
          </div>
        )}

        {/* ===== PERSONAL BALANCES ===== */}
        {data.personal.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-sm font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>
                Personal
              </h2>
              <button onClick={() => navigate('/personal')} className="text-xs" style={{ color: 'var(--color-accent)' }} id="btn-see-all-personal">
                See all →
              </button>
            </div>
            <div className="surface-card overflow-hidden">
              <div className="passbook-top-border" />
              {data.personal.slice(0, 4).map(p => (
                <PassbookRow
                  key={p.user?.id}
                  description={p.user?.name || 'Unknown'}
                  subtext={p.net > 0 ? 'Owes you' : 'You owe'}
                  amount={p.net}
                  onClick={() => navigate(`/personal/${p.user?.id}`)}
                  icon={<div className="avatar-circle">{p.user?.avatar || '?'}</div>}
                />
              ))}
            </div>
          </div>
        )}

        {/* ===== RECENT TRANSACTIONS ===== */}
        {data.recent.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-2 px-1" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>
              Recent Transactions
            </h2>
            <div className="surface-card overflow-hidden">
              <div className="passbook-top-border" />
              {data.recent.map(e => {
                const isMyPay = e.paid_by === user.id;
                return (
                  <PassbookRow
                    key={e.id}
                    description={e.description}
                    subtext={`${e.group?.name} · ${isMyPay ? 'You paid' : `${e.payer?.name} paid`}`}
                    date={e.created_at}
                    amount={isMyPay ? e.amount * 0.75 : -(e.amount / 4)}
                    icon={<div className="avatar-circle text-xs">{isMyPay ? 'Y' : e.payer?.avatar || '?'}</div>}
                    onClick={() => navigate(`/groups/${e.group_id}`)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {data.groups.length === 0 && data.personal.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-base font-semibold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>
              Your ledger is empty
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>Create a group or add a personal record to get started.</p>
            <button onClick={() => navigate('/groups')} className="btn-primary" id="btn-dashboard-create-group">
              <Plus size={16} /> Create a Group
            </button>
          </div>
        )}

        <div className="bottom-nav-spacer" />
      </div>

      {showModal && <ExpenseModal onClose={() => setShowModal(false)} onSave={load} />}
    </div>
  );
}
