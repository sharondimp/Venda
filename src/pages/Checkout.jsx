import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { db } from '../firebase'
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { sendOrderConfirmation, sendNewOrderToSeller } from '../utils/emailService'

export default function Checkout() {
  const { storeSlug, productId } = useParams()
  const [product, setProduct] = useState(null)
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', note: '', deliveryZone: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productSnap = await getDoc(doc(db, 'products', productId))
        if (!productSnap.exists()) return
        const productData = { id: productSnap.id, ...productSnap.data() }
        setProduct(productData)
        const sellerSnap = await getDoc(doc(db, 'sellers', productData.sellerId))
        if (sellerSnap.exists()) setSeller({ id: sellerSnap.id, ...sellerSnap.data() })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [productId])

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }))

  const deliveryZones = seller?.deliveryZones || []
  const selectedZone = deliveryZones.find(z => z.location === form.deliveryZone)
  const deliveryFee = product?.type === 'physical'
    ? (selectedZone ? selectedZone.price : (deliveryZones.length === 0 ? 2000 : 0))
    : 0
  const total = (product?.price || 0) + deliveryFee

  const handlePay = () => {
    setError('')
    if (!form.name || !form.email) return setError('Name and email are required')
    if (product?.type === 'physical') {
      if (!form.phone || !form.address) return setError('Phone and delivery address are required')
      if (deliveryZones.length > 0 && !form.deliveryZone) return setError('Please select your delivery location')
    }

    setPaying(true)
    setTimeout(() => {
      try {
        const handler = window.PaystackPop.setup({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
          email: form.email,
          amount: total * 100,
          currency: 'NGN',
          callback: async (response) => {
            try {
              const newOrderId = `VDA-${Date.now().toString().slice(-6)}`
              setOrderId(newOrderId)
              await addDoc(collection(db, 'orders'), {
                orderId: newOrderId,
                productId: product.id,
                productName: product.name,
                sellerId: seller.id,
                sellerName: seller.fullName,
                sellerEmail: seller.email,
                buyerName: form.name,
                buyerEmail: form.email,
                buyerPhone: form.phone || null,
                deliveryAddress: form.address ? `${form.address}, ${form.city}` : null,
                deliveryZone: form.deliveryZone || null,
                deliveryFee,
                note: form.note || null,
                amount: product.price,
                type: product.type,
                status: 'pending',
                paystackRef: response.reference,
                createdAt: serverTimestamp(),
              })
              await sendOrderConfirmation({
                buyerName: form.name,
                buyerEmail: form.email,
                buyerPhone: form.phone,
                productName: product.name,
                amount: product.price,
                orderId: newOrderId,
                isDigital: product.type === 'digital',
                downloadLink: product.downloadUrl || '',
              })
              await sendNewOrderToSeller({
                sellerName: seller.fullName,
                sellerEmail: seller.email,
                buyerEmail: form.email,
                buyerPhone: form.phone,
                productName: product.name,
                amount: product.price,
                orderId: newOrderId,
                isDigital: product.type === 'digital',
                deliveryAddress: form.address ? `${form.address}, ${form.city}` : null,
              })
              setSuccess(true)
            } catch (err) {
              console.error(err)
              setError('Payment received but order failed to save. Contact support.')
            } finally {
              setPaying(false)
            }
          },
          onClose: () => setPaying(false),
        })
        handler.openIframe()
      } catch (err) {
        setError('Payment failed. Please try again.')
        setPaying(false)
      }
    }, 300)
  }

  if (loading) return null

  if (!product) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '2rem' }}>😕</div>
      <div>Product not found</div>
      <Link to={`/store/${storeSlug}`} className="btn-primary">Back to Store</Link>
    </div>
  )

  if (success) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Order Placed!</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Order ID: <strong>{orderId}</strong></div>
        {product.type === 'digital' ? (
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Your download link has been sent to <strong>{form.email}</strong>. Check your inbox!</p>
        ) : (
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Order confirmed! The seller will contact you at <strong>{form.phone}</strong> to arrange delivery.</p>
        )}
        <Link to={`/store/${storeSlug}`} className="btn-primary" style={{ justifyContent: 'center', width: '100%' }}>Back to Store</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg2)' }}>
      <div style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '1rem 5%' }}>
        <Link to={`/store/${storeSlug}`} style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)', textDecoration: 'none' }}>
          Ven<span style={{ color: 'var(--blue)' }}>da</span>
        </Link>
      </div>

      <div style={{ padding: '2.5rem 5%', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', maxWidth: '860px', margin: '0 auto' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem' }}>Complete your order</div>
          {error && <div style={{ background: 'rgba(229,62,62,0.08)', border: '1px solid rgba(229,62,62,0.2)', borderRadius: '8px', padding: '0.7rem 1rem', marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</div>}

          <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' }}>Your Details</div>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your full name" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" />
              <span className="form-hint">{product.type === 'digital' ? 'Your download link will be sent here' : 'Order confirmation goes here'}</span>
            </div>
            {product.type === 'physical' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone Number *</label>
                <input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="08012345678" />
              </div>
            )}
          </div>

          {product.type === 'physical' && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' }}>Delivery Details</div>

              {/* Delivery zone picker */}
              {deliveryZones.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Select Delivery Location *</label>
                  <select value={form.deliveryZone} onChange={e => update('deliveryZone', e.target.value)}>
                    <option value="">-- Choose your location --</option>
                    {deliveryZones.map((z, i) => (
                      <option key={i} value={z.location}>{z.location} — ₦{z.price?.toLocaleString()}</option>
                    ))}
                  </select>
                  {form.deliveryZone && (
                    <span className="form-hint" style={{ color: 'var(--blue)' }}>Delivery fee: ₦{selectedZone?.price?.toLocaleString()}</span>
                  )}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Delivery Address *</label>
                <input value={form.address} onChange={e => update('address', e.target.value)} placeholder="Street address" />
              </div>
              <div className="form-group">
                <label className="form-label">City / State</label>
                <input value={form.city} onChange={e => update('city', e.target.value)} placeholder="e.g. Lagos" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Order Note (optional)</label>
                <textarea value={form.note} onChange={e => update('note', e.target.value)} placeholder="Any special instructions?" rows={2} style={{ resize: 'none' }} />
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div>
          <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '1.5rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '1.2rem', fontSize: '0.9rem' }}>Order Summary</div>
            <div style={{ display: 'flex', gap: '0.9rem', marginBottom: '1.2rem', paddingBottom: '1.2rem', borderBottom: '1px solid var(--border)' }}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '56px', height: '56px', background: 'var(--bg2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                  {product.type === 'digital' ? '💻' : '📦'}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{product.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>from {seller?.storeName}</div>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(26,47,212,0.08)', color: 'var(--blue)', border: '1px solid rgba(0,168,120,0.2)', marginTop: '0.3rem', display: 'inline-block' }}>{product.type}</span>
              </div>
            </div>
            {[
              ['Subtotal', `₦${product.price?.toLocaleString()}`],
              ...(product.type === 'physical' ? [['Delivery fee', deliveryFee ? `₦${deliveryFee.toLocaleString()}` : form.deliveryZone ? '₦0' : 'Select location']] : []),
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.6rem' }}>
                <span style={{ color: 'var(--muted)' }}>{k}</span>
                <span>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem', marginBottom: '1.2rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--blue)' }}>₦{total.toLocaleString()}</span>
            </div>
            <button onClick={handlePay} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }} disabled={paying}>
              {paying ? 'Processing...' : `Pay ₦${total.toLocaleString()} via Paystack`}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.7rem' }}>🔒 Secure payment via Paystack</p>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 640px) { div[style*="320px"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
