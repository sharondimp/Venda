import { useState } from 'react'
import { useAuth } from '../context/AppContext'
import Navbar from '../components/Navbar'

export default function Upgrade() {
  const { user } = useAuth()
  const [billing, setBilling] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  const price = billing === 'monthly' ? 5000 : 50000
  const saving = billing === 'yearly' ? '₦10,000 saved' : null

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleUpgrade = () => {
    setLoading(true)
    setTimeout(() => {
      try {
        const handler = window.PaystackPop.setup({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
          email: user?.email,
          amount: price * 100,
          currency: 'NGN',
          callback: () => {
            showToast('Payment successful! Your account will be upgraded shortly. 🎉')
            setLoading(false)
          },
          onClose: () => setLoading(false),
        })
        handler.openIframe()
      } catch (err) {
        showToast('Something went wrong. Please try again.')
        setLoading(false)
      }
    }, 300)
  }

  const features = [
    { icon: '📦', text: 'Unlimited products (free: 5 max)' },
    { icon: '📊', text: 'Store analytics — views, sales, revenue' },
    { icon: '🔍', text: 'Priority in marketplace search results' },
    { icon: '⭐', text: 'Pro seller badge on your store' },
    { icon: '🎯', text: '50% off Featured Product ads (₦500 instead of ₦1,000)' },
    { icon: '🚚', text: 'Dimpa-assisted delivery for physical orders' },
    { icon: '💬', text: 'Priority support' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg2)' }}>
      <Navbar variant="dashboard" />
      {toast && <div className="toast success">{toast}</div>}
      <div style={{ paddingTop: '64px', padding: '5rem 5% 3rem' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(26,47,212,0.08)', border: '1px solid rgba(26,47,212,0.2)', color: 'var(--blue)', borderRadius: '50px', padding: '0.3rem 0.9rem', fontSize: '0.78rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '0.04em' }}>⚡ UPGRADE TO PRO</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Go Pro</div>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Unlock everything and grow your store without limits</p>
          </div>

          <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: '10px', padding: '4px', marginBottom: '2rem', maxWidth: '300px', margin: '0 auto 2rem' }}>
            {['monthly', 'yearly'].map(b => (
              <button key={b} onClick={() => setBilling(b)} style={{ flex: 1, padding: '0.55rem', borderRadius: '7px', fontSize: '0.875rem', fontWeight: 600, background: billing === b ? 'var(--card)' : 'transparent', color: billing === b ? 'var(--text)' : 'var(--muted)', boxShadow: billing === b ? 'var(--shadow)' : 'none', transition: 'all 0.2s', textTransform: 'capitalize', border: 'none', cursor: 'pointer' }}>
                {b} {b === 'yearly' && <span style={{ fontSize: '0.68rem', color: 'var(--blue)', fontWeight: 700 }}>SAVE ₦10K</span>}
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: '2rem', border: '2px solid var(--blue)', boxShadow: '0 0 0 4px rgba(26,47,212,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Pro Plan</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>
                  ₦{price.toLocaleString()}
                  <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--muted)' }}> / {billing === 'monthly' ? 'month' : 'year'}</span>
                </div>
                {saving && <div style={{ fontSize: '0.78rem', color: 'var(--blue)', fontWeight: 700, marginTop: '0.3rem' }}>🎉 {saving} vs monthly</div>}
              </div>
              <span className="badge badge-blue">MOST POPULAR</span>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              {features.map(f => (
                <div key={f.text} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.55rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                  <span>{f.icon}</span>
                  <span style={{ color: 'var(--light)' }}>{f.text}</span>
                </div>
              ))}
            </div>

            <button onClick={handleUpgrade} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem' }} disabled={loading}>
              {loading ? 'Processing...' : `Pay ₦${price.toLocaleString()} via Paystack`}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.8rem' }}>Secure payment via Paystack · Cancel anytime</p>
          </div>
        </div>
      </div>
    </div>
  )
}
