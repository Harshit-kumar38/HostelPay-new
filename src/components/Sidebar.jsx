import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, User, Plus, ArrowLeftRight, Sun, Moon, LogOut, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/groups', icon: Users, label: 'Groups' },
  { to: '/personal', icon: User, label: 'Personal' },
  { to: '/settle', icon: ArrowLeftRight, label: 'Settle' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 z-30"
      style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}
    >
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-accent)' }}>
            <BookOpen size={18} color="#14151F" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-semibold text-base leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--color-text)' }}>
              HostelPay
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Night Ledger</p>
          </div>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="avatar-circle text-base">{user.avatar || user.name?.[0]}</div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)', fontFamily: 'Inter, sans-serif' }}>{user.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>{user.email || 'Demo mode'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 p-3 flex flex-col gap-1" aria-label="Sidebar navigation">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            id={`sidebar-nav-${label.toLowerCase()}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-accent)' : 'var(--color-muted)',
              background: isActive ? 'var(--color-accent)18' : 'transparent',
              fontFamily: 'Inter, sans-serif',
            })}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        {/* Add button */}
        <button
          onClick={() => navigate('/add')}
          id="sidebar-btn-add"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium mt-2"
          style={{ background: 'var(--color-accent)20', color: 'var(--color-accent)', fontFamily: 'Inter, sans-serif' }}
        >
          <Plus size={18} />
          Add Expense
        </button>
      </nav>

      {/* Bottom: theme + logout */}
      <div className="p-3 border-t flex flex-col gap-1" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={toggle}
          id="sidebar-btn-theme"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full"
          style={{ color: 'var(--color-muted)', fontFamily: 'Inter, sans-serif' }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={handleLogout}
          id="sidebar-btn-logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full"
          style={{ color: 'var(--color-muted)', fontFamily: 'Inter, sans-serif' }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
