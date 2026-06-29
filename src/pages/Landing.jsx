import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar variant="public" />

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '8rem 5% 5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(0,168,120,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--green-soft)', border: '1px solid rgba(0,168,120,0.2)', color: 'var(--green)', borderRadius: '50px', padding: '0.35rem 1rem', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '1.8rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', animation: 'pulse 2s infinite' }} />
          Verified sellers only
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 5vw, 4.2rem)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: '1.2rem', maxWidth: '700px' }}>
          The marketplace<br />Nigeria can{' '}
          <span style={{ color: 'var(--green)', textDecoration: 'underline', textDecorationColor: 'var(--green)', textUnderlineOffset: '4px' }}>trust.</span>
        </h1>

        <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', color: 'var(--muted)', maxWidth: '460px', margin: '0 auto 2.2rem', lineHeight: 1.75 }}>
          Sell physical and digital products online. Get paid in naira. No dollar stress, no scammers — every seller on Venda is verified.
        </p>

        <div style={{ display: 'flex', gap: '0.9rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn-primary" style={{ padding: '0.8rem 1.8rem', fontSize: '0.95rem', borderRadius: '10px' }}>Start Selling Free →</Link>
          <a href="#how" className="btn-secondary" style={{ padding: '0.8rem 1.8rem', fontSize: '0.95rem', borderRadius: '10px' }}>See how it works</a>
        </div>

        <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }`}</style>
      </section>

      {/* STATS */}
      <div style={{ background: 'var(--green)', padding: '2.5rem 5%', display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
        {[['100%','Verified sellers'],['₦0','Transaction fees'],['2','Product types'],['24h','Verification time']].map(([n, l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: '0.25rem' }}>{n}</div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '5rem 5%', background: 'var(--bg2)' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'inline-block', width: '18px', height: '2px', background: 'var(--green)', borderRadius: '2px' }} />
          How it works
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.8rem', lineHeight: 1.1 }}>Selling on Venda<br />is straightforward.</h2>
        <p style={{ color: 'var(--muted)', maxWidth: '460px', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: '2.5rem' }}>No complicated setup. Create your store, list your products, start getting paid.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.2rem' }}>
          {[
            ['01', 'Create your account', 'Sign up with your email and tell us what you sell — physical, digital, or both.'],
            ['02', 'Get verified', 'Submit your NIN. We review within 24 hours and keep Venda scammer-free for everyone.'],
            ['03', 'Set up your store', 'Add your store name, logo, and banner. List up to 5 products on the free plan.'],
            ['04', 'Share & get paid', 'Share your store link anywhere. Buyers pay via Paystack — no account needed on their end.'],
          ].map(([n, t, d]) => (
            <div key={n} className="card" style={{ transition: 'border-color 0.2s, transform 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, WebkitTextStroke: '2px var(--green)', color: 'transparent', lineHeight: 1, marginBottom: '0.9rem' }}>{n}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem' }}>{t}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.65 }}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT TYPES */}
      <section id="products" style={{ padding: '5rem 5%', background: 'var(--bg)' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'inline-block', width: '18px', height: '2px', background: 'var(--green)', borderRadius: '2px' }} />
          What you can sell
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.8rem', lineHeight: 1.1 }}>Physical. Digital.<br />Both. Your choice.</h2>
        <p style={{ color: 'var(--muted)', maxWidth: '460px', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: '2.5rem' }}>Venda supports whatever you're selling — no restrictions on product type.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
          {[
            { emoji: '📦', title: 'Physical Products', desc: 'Sell tangible items that get shipped or picked up. You handle delivery, or upgrade to Premium for Venda-assisted delivery.', tags: ['Clothing', 'Accessories', 'Food', 'Handmade items', 'Beauty products'] },
            { emoji: '💻', title: 'Digital Products', desc: 'Upload once, sell unlimited times. Buyers get an instant download link after payment — no delivery needed.', tags: ['Ebooks', 'Templates', 'Presets', 'Courses', 'Graphics', 'Music'] },
          ].map(p => (
            <div key={p.title} className="card" style={{ transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}>
              <span style={{ fontSize: '2rem', marginBottom: '0.9rem', display: 'block' }}>{p.emoji}</span>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>{p.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '0.9rem' }}>{p.desc}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {p.tags.map(t => <span key={t} style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.18rem 0.5rem', borderRadius: '4px', background: 'var(--green-soft)', color: 'var(--green)', border: '1px solid rgba(0,168,120,0.2)' }}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY VENDA */}
      <section id="why" style={{ padding: '5rem 5%', background: 'var(--bg2)' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'inline-block', width: '18px', height: '2px', background: 'var(--green)', borderRadius: '2px' }} />
          Why Venda
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.8rem', lineHeight: 1.1 }}>Built for Nigerian<br />sellers. Finally.</h2>
        <p style={{ color: 'var(--muted)', maxWidth: '460px', fontSize: '0.9rem', lineHeight: 1.75, marginBottom: '2.5rem' }}>Other platforms were built for someone else. Venda was built for you.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.2rem' }}>
          {[
            ['✅', 'Verified sellers only', 'Every seller is verified with NIN. Buyers shop with confidence — no scammers allowed.'],
            ['💚', 'Naira payments', 'Powered by Paystack. No dollar conversion, no international payment stress. Naira in, naira out.'],
            ['⚡', 'Instant digital delivery', 'Digital buyers get their download link immediately after payment. No waiting, no back and forth.'],
            ['🚫', 'Zero transaction fees', 'We don\'t take a cut of your sales. Ever. Pay a flat subscription and keep every kobo you earn.'],
            ['🌙', 'Dark & light mode', 'Shop or sell in whatever mode fits your vibe. Toggle from the menu anytime.'],
            ['📱', 'Works on any device', 'Fully responsive. Manage your store from your phone, tablet, or laptop without any issues.'],
          ].map(([icon, title, desc]) => (
            <div key={title} className="card" style={{ transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ width: '42px', height: '42px', background: 'var(--green-soft)', border: '1px solid rgba(0,168,120,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', marginBottom: '0.9rem' }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>{title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.65 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div style={{ background: 'var(--green)', padding: '5rem 5%', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.9rem' }}>Ready to start selling?</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', marginBottom: '2rem' }}>Join Venda today. It's free — no credit card needed.</p>
        <Link to="/register" style={{ background: '#fff', color: 'var(--green)', padding: '0.85rem 2rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', display: 'inline-block', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>Create your store →</Link>
      </div>

      {/* FOOTER */}
      <footer style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '2.5rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem' }}>Ven<span style={{ color: 'var(--green)' }}>da</span></Link>
        <div style={{ display: 'flex', gap: '1.4rem', flexWrap: 'wrap' }}>
          {[['#how','How it works'],['#products','Products'],['#why','Why Venda'],].map(([h,l]) => (
            <a key={l} href={h} style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none' }}>{l}</a>
          ))}
          <Link to="/login" style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Log in</Link>
          <Link to="/register" style={{ fontSize: '0.82rem', color: 'var(--green)', fontWeight: 600 }}>Sign up</Link>
        </div>
        <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>© 2026 Venda · Real sellers. Real products.</div>
      </footer>
    </div>
  )
}
