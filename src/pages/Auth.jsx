import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Auth() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, demoLogin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate('/dashboard'); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!name.trim()) { setError('Enter your name.'); setLoading(false); return; }
        await signup(name.trim(), email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };



  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-accent)' }}>
          <BookOpen size={20} color="#14151F" strokeWidth={2.5} />
        </div>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color: 'var(--color-text)' }}>
          HostelPay
        </span>
      </div>

      <div className="surface-card w-full max-w-sm p-6">
        {/* Mode toggle */}
        <div className="flex gap-0 mb-6 p-1 rounded-lg" style={{ background: 'var(--color-bg)' }}>
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className="flex-1 py-2 rounded-md text-sm font-medium transition-colors"
            id="btn-mode-login"
            style={{
              background: mode === 'login' ? 'var(--color-surface)' : 'transparent',
              color: mode === 'login' ? 'var(--color-text)' : 'var(--color-muted)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Log In
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); }}
            className="flex-1 py-2 rounded-md text-sm font-medium transition-colors"
            id="btn-mode-signup"
            style={{
              background: mode === 'signup' ? 'var(--color-surface)' : 'transparent',
              color: mode === 'signup' ? 'var(--color-text)' : 'var(--color-muted)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>YOUR NAME</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Harshit Kumar"
                className="hp-input"
                id="input-auth-name"
                autoFocus
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="hp-input"
              id="input-auth-email"
              autoFocus={mode === 'login'}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>PASSWORD</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="hp-input pr-10"
                id="input-auth-password"
                required
                minLength={4}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-muted)' }}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm" style={{ color: 'var(--color-negative)' }}>{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary justify-center w-full py-3" id="btn-auth-submit">
            {loading ? 'Please wait…' : mode === 'signup' ? 'Create Account' : 'Log In'} {!loading && <ArrowRight size={16} />}
          </button>
        </form>


      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-6 text-sm"
        style={{ color: 'var(--color-muted)' }}
        id="btn-back-landing"
      >
        ← Back to home
      </button>
    </div>
  );
}
