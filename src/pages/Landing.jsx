import { Link } from 'react-router-dom'
import { useTheme } from '../context/AppContext'
import Navbar from '../components/Navbar'

export default function Landing() {
  const { theme } = useTheme()

  const features = [
    { icon: '🛡️', title: 'Verified Sellers Only', desc: 'Every seller on Dimpa is identity-verified. No scammers, no fakes.' },
    { icon: '🔒', title: 'Secure Payments', desc: 'Payments are held safely and only released after successful delivery.' },
    { icon: '📦', title: 'Physical & Digital', desc: 'Sell clothes, food, handmade items, ebooks, templates, courses and more.' },
    { icon: '🚀', title: 'Your Own Storefront', desc: 'Get a beautiful store page you can share directly with customers.' },
    { icon: '📊', title: 'Sales Analytics', desc: 'Track your revenue, orders and store views in real time. (Pro)' },
    { icon: '🎯', title: 'Featured Products', desc: 'Boost visibility by featuring your product at the top of the marketplace.' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar variant="public" />

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7rem 5% 5rem', background: theme === 'dark' ? 'radial-gradient(ellipse at 20% 50%, rgba(26,47,212,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,200,150,0.08) 0%, transparent 50%)' : 'radial-gradient(ellipse at 20% 50%, rgba(26,47,212,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,200,150,0.04) 0%, transparent 50%)', textAlign: 'center' }}>
        <div style={{ maxWidth: '720px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(26,47,212,0.08)', border: '1px solid rgba(26,47,212,0.2)', color: 'var(--blue)', borderRadius: '50px', padding: '0.3rem 0.9rem', fontSize: '0.78rem', fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '0.06em' }}>
            🇳🇬 MADE FOR NIGERIA
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 7vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: '1.2rem' }}>
            The marketplace<br />
            <span style={{ background: 'linear-gradient(135deg, var(--blue) 0%, var(--teal) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Nigeria can trust.</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', color: 'var(--muted)', maxWidth: '520px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Buy and sell physical and digital products online. Get paid in naira. Every seller is verified — no scammers, no stress.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem', borderRadius: '10px', background: 'linear-gradient(135deg, var(--blue) 0%, var(--blue-dim) 100%)', boxShadow: '0 8px 24px rgba(26,47,212,0.3)' }}>
              Start Selling Free →
            </Link>
            <Link to="/marketplace" className="btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1rem', borderRadius: '10px' }}>
              Start Shopping →
            </Link>
          </div>
          <p style={{ marginTop: '1.2rem', fontSize: '0.8rem', color: 'var(--muted)' }}>Free to join · No hidden fees · Verified sellers only</p>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ padding: '5rem 5%', background: 'var(--bg2)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>How it works</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>Simple. Secure. Seamless.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[
              { step: '01', title: 'Register your store', desc: 'Create an account, verify your identity with your NIN, and set up your store in minutes.' },
              { step: '02', title: 'List your products', desc: 'Add your physical or digital products with photos, descriptions, and prices.' },
              { step: '03', title: 'Share your store', desc: 'Share your unique store link on WhatsApp, Instagram, or anywhere you want.' },
              { step: '04', title: 'Get paid securely', desc: 'Buyers pay via Paystack. Money is released to you after successful delivery.' },
            ].map(s => (
              <div key={s.step} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'rgba(26,47,212,0.15)', marginBottom: '0.75rem' }}>{s.step}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{s.title}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '5rem 5%' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Features</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>Everything you need to sell</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem' }}>
            {features.map(f => (
              <div key={f.title} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.3rem' }}>
                <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '0.3rem', fontFamily: 'var(--font-display)' }}>{f.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '5rem 5%', background: 'var(--bg2)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Pricing</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>Start free. Upgrade when ready.</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '3rem', fontSize: '0.95rem' }}>No commissions on physical products. Ever.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            <div className="card" style={{ padding: '2rem', textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Free</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '1.2rem' }}>₦0</div>
              {['Up to 5 products', 'Your own store page', 'Paystack checkout', 'Order management', 'NIN verification'].map(f => (
                <div key={f} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--teal)' }}>✓</span> {f}
                </div>
              ))}
              <Link to="/register" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}>Get started free</Link>
            </div>
            <div className="card" style={{ padding: '2rem', textAlign: 'left', border: '2px solid var(--blue)', background: 'rgba(26,47,212,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>Pro</div>
                <span className="badge badge-blue">POPULAR</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '0.2rem' }}>₦5,000</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '1.2rem' }}>per month · ₦50,000/year</div>
              {['Unlimited products', 'Store analytics', 'Priority in search', 'Pro badge on store', '50% off featured ads', 'Priority support'].map(f => (
                <div key={f} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--blue)' }}>✓</span> {f}
                </div>
              ))}
              <Link to="/register" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}>Start with Pro</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 5%', textAlign: 'center', background: 'linear-gradient(135deg, var(--blue-dark) 0%, var(--blue-dim) 100%)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.03em' }}>Ready to start selling?</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', fontSize: '1rem' }}>Join verified sellers already growing their business on Dimpa.</p>
        <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.9rem 2.2rem', background: '#fff', color: 'var(--blue)', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', fontFamily: 'var(--font-display)' }}>
          Create your free store →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '2.5rem 5%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)', textDecoration: 'none' }}>
            <span style={{ color: 'var(--blue)' }}>D</span>impa
          </Link>
          <div style={{ display: 'flex', gap: '1.4rem', flexWrap: 'wrap' }}>
            {[['#how','How it works'],['#features','Features'],['#pricing','Pricing']].map(([h,l]) => (
              <a key={l} href={h} style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none' }}>{l}</a>
            ))}
            <Link to="/login" style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none' }}>Log in</Link>
            <Link to="/register" style={{ fontSize: '0.82rem', color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
            <Link to="/dispute" style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none' }}>Report an issue</Link>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>© 2026 Dimpa · Buy. Sell. Grow.</div>
          <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
            <a href="https://instagram.com/dimpaapp" target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none' }}>📸 Instagram</a>
            <a href="https://tiktok.com/@dimpaapp" target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none' }}>🎵 TikTok</a>
            <a href="mailto:hello@dimpa.ng" style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none' }}>✉️ hello@dimpa.ng</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
