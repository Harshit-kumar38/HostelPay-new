import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, User, Plus, ArrowLeftRight } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/groups', icon: Users, label: 'Groups' },
  { to: '/add', icon: Plus, label: 'Add', isCenter: true },
  { to: '/personal', icon: User, label: 'Personal' },
  { to: '/settle', icon: ArrowLeftRight, label: 'Settle' },
];

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ to, icon: Icon, label, isCenter }) => {
          if (isCenter) {
            return (
              <button
                key={to}
                onClick={() => navigate('/add')}
                className="flex flex-col items-center -mt-6"
                aria-label="Add expense"
                id="btn-add-expense-bottom"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: 'var(--color-accent)' }}
                >
                  <Icon size={24} color="#14151F" strokeWidth={2.5} />
                </div>
                <span className="text-xs mt-1" style={{ color: 'var(--color-accent)', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '10px' }}>
                  {label}
                </span>
              </button>
            );
          }
          return (
            <NavLink
              key={to}
              to={to}
              id={`nav-${label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${isActive ? 'text-accent' : ''}`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--color-accent)' : 'var(--color-muted)',
              })}
              aria-label={label}
            >
              <Icon size={20} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '10px' }}>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
