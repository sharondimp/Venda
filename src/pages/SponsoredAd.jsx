import { useState, useEffect } from 'react'
import { useAuth } from '../context/AppContext'
import { db } from '../firebase'
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import Navbar from '../components/Navbar'

export default function SponsoredAd() {
  const { user } = useAuth()
  const isPremium = user?.plan === 'premium'
  const price = isPremium ? 500 : 1000

  const [products, setProducts] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ productId: '', date: '', note: '' })
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [paying, setPaying] = useState(false)
  const [slotsInfo, setSlotsInfo] = useState({})

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    if (!user?.uid) return
    const fetchData = async () => {
      try {
        const pQ = query(collection(db, 'products'), where('sellerId', '==', user.uid))
        const pSnap = await getDocs(pQ)
        setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.status === 'active'))
        const sQ = query(collection(db, 'sponsoredAds'), where('sellerId', '==', user.uid))
        const sSnap = await getDocs(sQ)
        setSubmissions(sSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const checkSlots = async (date) => {
    if (!date) return
    try {
      const q = query(collection(db, 'sponsoredAds'), where('date', '==', date), where('status', '==', 'approved'))
      const snap = await getDocs(q)
      setSlotsInfo({ date, taken: snap.size, available: 3 - snap.size })
    } catch (err) {
      console.error(err)
    }
  }

  const handlePay = () => {
    setError('')
    if (!form.productId) return setError('Please select a product')
    if (!form.date) return setError('Please select a date')
    if (slotsInfo.date === form.date && slotsInfo.available <= 0) return setError('No slots available for this date. Please pick another day.')

    const PaystackPop = window.PaystackPop
    if (!PaystackPop) {
      setError('Payment system not ready. Please refresh the page and try again.')
      return
    }

    setPaying(true)
    try {
      const handler = PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: price * 100,
        currency: 'NGN',
        callback: async (response) => {
          try {
            const product = products.find(p => p.id === form.productId)
            await addDoc(collection(db, 'sponsoredAds'), {
              sellerId: user.uid,
              sellerName: user.fullName,
              sellerEmail: user.email,
              storeName: user.storeName,
              storeSlug: user.storeSlug,
              productId: form.productId,
              productName: product?.name,
              productImage: product?.imageUrl || '',
              productPrice: product?.price,
              date: form.date,
              note: form.note || '',
              amount: price,
              status: 'pending',
              paystackRef: response.reference,
              createdAt: serverTimestamp(),
            })
            showToast("Submitted! We'll review and approve within a few hours 🎉")
            setForm({ productId: '', date: '', note: '' })
            const sQ = query(collection(db, 'sponsoredAds'), where('sellerId', '==', user.uid))
            const sSnap = await getDocs(sQ)
            setSubmissions(sSnap.docs.map(d => ({ id: d.id, ...d.data() })))
          } catch (err) {
            setError('Payment received but submission failed. Contact support.')
          } finally {
            setPaying(false)
          }
        },
        onClose: () => setPaying(false),
      })
      handler.openIframe()
    } catch (err) {
      setError('Payment failed to open. Please refresh and try again.')
      setPaying(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg2)' }}>
      <Navbar variant="dashboard" />
      {toast && <div className="toast success">{toast}</div>}
      <div style={{ paddingTop: '64px', padding: '5rem 5% 3rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.2rem' }}>⭐ Feature a Product</div>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Put your product at the top of the marketplace for 24 hours</p>
        </div>

        <div className="card" style={{ marginBottom: '2rem', background: 'var(--green-soft)', border: '1px solid rgba(0,168,120,0.2)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.75rem' }}>How it works</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {[
              ['1️⃣', 'Pick a product and date'],
              ['2️⃣', `Pay ₦${price.toLocaleString()}${isPremium ? ' (50% off!)' : ''}`],
              ['3️⃣', 'We review and approve'],
              ['4️⃣', 'Your product is featured for 24hrs'],
            ].map(([n, t]) => (
              <div key={n} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--light)' }}>
                <span>{n}</span><span>{t}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
            ⚠️ Only <strong>3 featured slots</strong> available per day. Book early!
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.8rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1.2rem' }}>Submit a Featured Product</div>
            {error && <div style={{ background: 'rgba(229,62,62,0.08)', border: '1px solid rgba(229,62,62,0.2)', borderRadius: '8px', padding: '0.7rem 1rem', marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</div>}

            <div className="form-group">
              <label className="form-label">Select Product</label>
              {products.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', padding: '0.7rem', background: 'var(--bg3)', borderRadius: '8px' }}>No active products. Add a product first.</div>
              ) : (
                <select value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}>
                  <option value="">-- Choose a product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — ₦{p.price?.toLocaleString()}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Featured Date</label>
              <input type="date" min={today} value={form.date} onChange={e => { setForm(f => ({ ...f, date: e.target.value })); checkSlots(e.target.value) }} />
              {slotsInfo.date === form.date && (
                <span style={{ fontSize: '0.78rem', color: slotsInfo.available <= 0 ? 'var(--danger)' : 'var(--green)', marginTop: '0.3rem', display: 'block' }}>
                  {slotsInfo.available <= 0 ? '❌ No slots left for this date' : `✅ ${slotsInfo.available} slot${slotsInfo.available !== 1 ? 's' : ''} available`}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Any special info for us?" rows={2} style={{ resize: 'none' }} />
            </div>

            <button onClick={handlePay} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }} disabled={paying || products.length === 0}>
              {paying ? 'Opening payment...' : `Pay ₦${price.toLocaleString()} via Paystack`}
            </button>
            {isPremium && <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--green)', marginTop: '0.5rem', fontWeight: 600 }}>🎉 50% Premium discount applied!</p>}
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Your Submissions</div>
            {loading ? (
              <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Loading...</div>
            ) : submissions.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No submissions yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {submissions.sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(s => (
                  <div key={s.id} style={{ padding: '0.75rem', background: 'var(--bg2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.2rem' }}>{s.productName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>📅 {s.date}</div>
                    <span className={`badge ${s.status === 'approved' ? 'badge-green' : s.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>{s.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <style>{`@media (max-width: 640px) { div[style*="300px"] { grid-template-columns: 1fr !important; } }`}</style>
      </div>
    </div>
  )
}
