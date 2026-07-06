import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, UserCheck, Zap, Menu, X, Wallet, TrendingUp, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect, useRef } from 'react';

/* ── animated ledger entries ── */
const ledgerEntries = [
  { desc: 'Electricity bill (June)', payer: 'You', amount: '+₹120.00', color: '#3DDC97' },
  { desc: 'WiFi recharge', payer: 'Rahul', amount: '-₹187.50', color: '#FF6B6B' },
  { desc: 'Grocery — Milk & Bread', payer: 'Priya', amount: '-₹50.00', color: '#FF6B6B' },
  { desc: 'Gas cylinder', payer: 'You', amount: '+₹40.00', color: '#3DDC97' },
  { desc: 'Laundry pool', payer: 'Aman', amount: '-₹30.00', color: '#FF6B6B' },
];

const stats = [
  { value: '₹42L+', label: 'Tracked' },
  { value: '8,200+', label: 'Users' },
  { value: '1.4L+', label: 'Expenses' },
  { value: '0 Math', label: 'Errors' },
];

const testimonials = [
  { name: 'Ananya S.', hostel: 'BIT Mesra', text: 'Finally no more "bhai kitna dena hai" every month 😂 HostelPay does it all.' },
  { name: 'Rohan K.', hostel: 'VIT Vellore', text: 'Added our group, added expenses — settled in 2 minutes. 10/10.' },
  { name: 'Sneha P.', hostel: 'NIT Trichy', text: 'Love the passbook feel. Feels legit like a bank app but simpler.' },
];

const steps = [
  { n: '01', title: 'Create or Join a Room', desc: 'Share a 6-char room code — roommates join instantly, no approval needed.', icon: <Users size={22} /> },
  { n: '02', title: 'Add an Expense', desc: 'Enter amount, who paid, and a note. Splits equally and updates all balances live.', icon: <Zap size={22} /> },
  { n: '03', title: 'Settle Up', desc: 'See who owes what. Share via WhatsApp in one tap & stamp it settled.', icon: <UserCheck size={22} /> },
];

/* ── useInView hook ── */
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.15, ...options });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

/* ── AnimatedEntry ── */
function AnimatedEntry({ entry, delay }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className="ledger-entry-row"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.45s ease, transform 0.45s ease',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {entry.desc}
        </p>
        <p style={{ fontSize: '11px', color: 'var(--color-muted)', fontFamily: 'IBM Plex Mono, monospace' }}>
          {entry.payer}
        </p>
      </div>
      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '13px', fontWeight: 700, color: entry.color, flexShrink: 0 }}>
        {entry.amount}
      </span>
    </div>
  );
}

/* ── Feature Card ── */
function FeatureCard({ icon, title, desc, delay, inView }) {
  return (
    <div
      className="feature-glass-card"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      <div className="feature-icon-wrap">{icon}</div>
      <h3 className="feature-card-title">{title}</h3>
      <p className="feature-card-desc">{desc}</p>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const [heroRef, heroInView] = useInView();
  const [featRef, featInView] = useInView();
  const [stepsRef, stepsInView] = useInView();
  const [testRef, testInView] = useInView();
  const [statsRef, statsInView] = useInView();



  return (
    <div className="landing-root">

      {/* ── Orb Background ── */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />

      {/* ── NAVBAR ── */}
      <header className="landing-nav">
        <div className="nav-inner">
          {/* Logo */}
          <a href="#" className="nav-logo" onClick={e => e.preventDefault()}>
            <div className="nav-logo-icon">
              <Wallet size={16} color="#14151F" strokeWidth={2.5} />
            </div>
            <span className="nav-logo-text">HostelPay</span>
          </a>

          {/* Desktop links */}
          <nav className="nav-links-desktop" aria-label="Main navigation">
            <a href="#features" className="nav-link" onClick={e => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>Features</a>
            <a href="#how-it-works" className="nav-link" onClick={e => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>How It Works</a>
          </nav>

          {/* Desktop actions */}
          <div className="nav-actions-desktop">
            <button onClick={toggle} className="nav-theme-btn" aria-label="Toggle theme" id="btn-landing-theme">
              {isDark ? '☀️' : '🌙'}
            </button>
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn-primary py-2 px-4 text-sm" id="btn-go-dashboard">Dashboard</button>
            ) : (
              <>
                <button onClick={() => navigate('/auth')} className="btn-secondary py-2 px-4 text-sm" id="btn-login">Log in</button>
                <button onClick={() => navigate('/auth?mode=signup')} className="btn-primary py-2 px-4 text-sm" id="btn-signup">Sign up</button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle mobile menu"
            id="btn-mobile-menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile slide-down menu */}
        <div className={`nav-mobile-menu ${menuOpen ? 'open' : ''}`}>
          <a href="#features" className="mobile-nav-link" onClick={() => { setMenuOpen(false); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>Features</a>
          <a href="#how-it-works" className="mobile-nav-link" onClick={() => { setMenuOpen(false); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}>How It Works</a>
          <hr className="mobile-nav-divider" />
          <div className="flex gap-2 px-4 pb-4">
            {user ? (
              <button onClick={() => { setMenuOpen(false); navigate('/dashboard'); }} className="btn-primary flex-1 justify-center" id="btn-mobile-dashboard">Dashboard</button>
            ) : (
              <>
                <button onClick={() => { setMenuOpen(false); navigate('/auth'); }} className="btn-secondary flex-1 justify-center" id="btn-mobile-login">Log in</button>
                <button onClick={() => { setMenuOpen(false); navigate('/auth?mode=signup'); }} className="btn-primary flex-1 justify-center" id="btn-mobile-signup">Sign up</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-inner">

          {/* Text side */}
          <div className="hero-text"
            style={{
              opacity: heroInView ? 1 : 0,
              transform: heroInView ? 'translateY(0)' : 'translateY(28px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            <div className="hero-eyebrow">
              <span>🏠</span> For hostel students &amp; roommates
            </div>

            <h1 className="hero-title">
              Never forget<br />
              <span className="hero-title-accent">who owes whom.</span>
            </h1>

            <p className="hero-subtitle">
              Track shared expenses and personal borrow/lend records with your roommates.
              Auto-calculates who owes what — no more messy WhatsApp math.
            </p>

            <div className="hero-ctas">
              <button onClick={() => navigate('/auth?mode=signup')} className="btn-primary hero-btn-primary" id="btn-hero-signup">
                Create Free Account <ArrowRight size={16} />
              </button>
            </div>

            <p className="hero-trust-note">✓ Free forever &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ Works offline</p>
          </div>

          {/* Live ledger mockup */}
          <div className="hero-mockup"
            style={{
              opacity: heroInView ? 1 : 0,
              transform: heroInView ? 'translateY(0)' : 'translateY(28px)',
              transition: 'opacity 0.7s 0.2s ease, transform 0.7s 0.2s ease',
            }}
          >
            <div className="mockup-phone">
              <div className="mockup-notch" />
              <div className="mockup-screen">
                {/* App bar */}
                <div className="mockup-appbar">
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--color-text)' }}>Room 214</span>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px', color: 'var(--color-accent)' }}>● LIVE</span>
                </div>

                {/* Balance chip */}
                <div className="mockup-balance">
                  <span style={{ fontSize: '11px', color: 'var(--color-muted)', fontFamily: 'IBM Plex Mono, monospace' }}>YOU OWE</span>
                  <span style={{ fontSize: '22px', fontWeight: 700, color: '#FF6B6B', fontFamily: 'IBM Plex Mono, monospace' }}>₹237.50</span>
                  <span style={{ fontSize: '10px', color: 'var(--color-muted)' }}>to Rahul</span>
                </div>

                {/* Animated entries */}
                <div className="mockup-entries">
                  {ledgerEntries.map((e, i) => (
                    <AnimatedEntry key={i} entry={e} delay={600 + i * 300} />
                  ))}
                </div>
              </div>
            </div>
            {/* Floating badges */}
            <div className="float-badge float-badge-1" style={{ animationDelay: '0s' }}>
              <span style={{ fontSize: '14px' }}>✅</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text)' }}>Settled!</span>
            </div>
            <div className="float-badge float-badge-2" style={{ animationDelay: '1.5s' }}>
              <span style={{ fontSize: '14px' }}>⚡</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text)' }}>Auto-split</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="stats-bar" ref={statsRef}>
        {stats.map((s, i) => (
          <div key={i} className="stat-item"
            style={{
              opacity: statsInView ? 1 : 0,
              transform: statsInView ? 'translateY(0)' : 'translateY(16px)',
              transition: `opacity 0.5s ease ${i * 100}ms, transform 0.5s ease ${i * 100}ms`,
            }}
          >
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section" id="features" ref={featRef}>
        <div className="section-inner">
          <div className="section-header">
            <span className="section-eyebrow">Why HostelPay</span>
            <h2 className="section-title">Everything you need,<br />nothing you don't.</h2>
            <p className="section-subtitle">Built specifically for hostel life in India.</p>
          </div>

          <div className="features-grid">
            <FeatureCard inView={featInView} delay={0}
              icon={<Wallet size={22} />}
              title="Group Expenses"
              desc="Create a room group, add expenses, and let HostelPay split the bill equally — no calculators needed."
            />
            <FeatureCard inView={featInView} delay={120}
              icon={<TrendingUp size={22} />}
              title="Personal Ledger"
              desc="Track who you lent to and who you borrowed from. Your own private passbook."
            />
            <FeatureCard inView={featInView} delay={240}
              icon={<Shield size={22} />}
              title="Settle & Stamp"
              desc="Mark debts settled with a satisfying stamp animation. Share a WhatsApp summary in one tap."
            />
            <FeatureCard inView={featInView} delay={360}
              icon={<Zap size={22} />}
              title="Instant & Offline"
              desc="No delays, no loading spinners. Works even without internet — your data stays on your device."
            />
            <FeatureCard inView={featInView} delay={480}
              icon={<Users size={22} />}
              title="Room Codes"
              desc="Share a 6-character code. Roommates join instantly — no awkward approval flows."
            />
            <FeatureCard inView={featInView} delay={600}
              icon={<UserCheck size={22} />}
              title="Balance Dashboard"
              desc="See your full financial picture at a glance — who owes you, who you owe, and by how much."
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section" id="how-it-works" ref={stepsRef}>
        <div className="section-inner">
          <div className="section-header">
            <span className="section-eyebrow">Simple by design</span>
            <h2 className="section-title">Three steps.<br />Under 10 seconds.</h2>
          </div>

          <div className="steps-list">
            {steps.map((step, i) => (
              <div key={step.n} className="step-card"
                style={{
                  opacity: stepsInView ? 1 : 0,
                  transform: stepsInView ? 'translateX(0)' : 'translateX(-24px)',
                  transition: `opacity 0.6s ease ${i * 180}ms, transform 0.6s ease ${i * 180}ms`,
                }}
              >
                <div className="step-number">{step.n}</div>
                <div className="step-icon-wrap">{step.icon}</div>
                <div className="step-text">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-section" ref={testRef}>
        <div className="section-inner">
          <div className="section-header">
            <span className="section-eyebrow">Loved by hostelers</span>
            <h2 className="section-title">What students say</h2>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card"
                style={{
                  opacity: testInView ? 1 : 0,
                  transform: testInView ? 'translateY(0)' : 'translateY(28px)',
                  transition: `opacity 0.6s ease ${i * 150}ms, transform 0.6s ease ${i * 150}ms`,
                }}
              >
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name[0]}</div>
                  <div>
                    <p className="testimonial-name">{t.name}</p>
                    <p className="testimonial-hostel">{t.hostel}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="cta-section">
        <div className="cta-orb" aria-hidden="true" />
        <div className="cta-inner">
          <h2 className="cta-title">Ready to clear the ledger?</h2>
          <p className="cta-subtitle">Join thousands of hostel students who've ditched the WhatsApp calculator.</p>
            <div className="cta-btns">
              <button onClick={() => navigate('/auth?mode=signup')} className="btn-primary cta-btn-primary" id="btn-cta-signup">
                Create Free Account <ArrowRight size={16} />
              </button>
            </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="footer-logo">
          <div className="nav-logo-icon" style={{ width: 24, height: 24 }}>
            <Wallet size={12} color="#14151F" strokeWidth={2.5} />
          </div>
          <span className="nav-logo-text" style={{ fontSize: '14px' }}>HostelPay</span>
        </div>
        <p className="footer-tagline">Built for hostel life · Made in India 🇮🇳</p>
        <p className="footer-copy">© 2024 HostelPay. All rights reserved.</p>
      </footer>
    </div>
  );
}
