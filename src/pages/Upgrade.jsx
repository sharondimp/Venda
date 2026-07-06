import { useState } from 'react'
import { useAuth } from '../context/AppContext'
import Navbar from '../components/Navbar'

export default function Upgrade() {
  const { user } = useAuth()
  const [billing, setBilling] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  const price = billing === 'monthly' ? 10000 : 100000
  const saving = billing === 'yearly' ? '₦20,000 saved' : null

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const PaystackPop = window.PaystackPop
      if (!PaystackPop) {
        showToast('Payment system loading, please try again')
        setLoading(false)
        return
      }
      const handler = PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: user?.email,
        amount: price * 100,
        currency: 'NGN',
        callback: (response) => {
          showToast('Payment successful! Your account will be upgraded shortly.')
          setLoading(false)
        },
        onClose: () => setLoading(false),
      })
      handler.openIframe()
    } catch (err) {
      showToast('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const features = [
    { icon: '📦', text: 'Unlimited products (free plan: 5 max)' },
    { icon: '📊', text: 'Store analytics — views, sales, revenue' },
    { icon: '📧', text: 'Email your store subscribers' },
    { icon: '🏷️', text: 'Promo & discount codes' },
    { icon: '🚚', text: 'Venda-assisted delivery for physical orders' },
    { icon: '⭐', text: 'Premium seller badge on your store' },
    { icon: '🔍', text: 'Priority in marketplace search results' },
    { icon: '💬', text: 'Priority support' },
    { icon: '⭐', text: '50% off Featured Product ads (₦500 instead of ₦1,000)' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg2)' }}>
      <Navbar variant="dashboard" />
      {toast && <div className="toast success">{toast}</div>}
      <div style={{ paddingTop: '64px', padding: '5rem 5% 3rem' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--green-soft)', border: '1px solid rgba(0,168,120,0.2)', color: 'var(--green)', borderRadius: '50px', padding: '0.3rem 0.9rem', fontSize: '0.78rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '0.04em' }}>⚡ UPGRADE</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Go Premium</div>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Unlock everything and grow your store without limits</p>
          </div>

          {/* Billing toggle */}
          <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: '10px', padding: '4px', marginBottom: '2rem', maxWidth: '300px', margin: '0 auto 2rem' }}>
            {['monthly', 'yearly'].map(b => (
              <button key={b} onClick={() => setBilling(b)} style={{ flex: 1, padding: '0.55rem', borderRadius: '7px', fontSize: '0.875rem', fontWeight: 600, background: billing === b ? 'var(--card)' : 'transparent', color: billing === b ? 'var(--text)' : 'var(--muted)', boxShadow: billing === b ? 'var(--shadow)' : 'none', transition: 'all 0.2s', textTransform: 'capitalize', border: 'none', cursor: 'pointer' }}>
                {b} {b === 'yearly' && <span style={{ fontSize: '0.68rem', color: 'var(--green)', fontWeight: 700 }}>SAVE ₦20K</span>}
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: '2rem', border: '2px solid var(--green)', boxShadow: '0 0 0 4px rgba(0,168,120,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Premium Plan</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>
                  ₦{price.toLocaleString()}
                  <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--muted)' }}> / {billing === 'monthly' ? 'month' : 'year'}</span>
                </div>
                {saving && <div style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 700, marginTop: '0.3rem' }}>🎉 {saving} vs monthly</div>}
              </div>
              <span className="badge badge-green">MOST POPULAR</span>
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
