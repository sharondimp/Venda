import { useState, useEffect } from 'react'
import { useAuth } from '../context/AppContext'
import { db } from '../firebase'
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore'
import Navbar from '../components/Navbar'

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [shippingPhoto, setShippingPhoto] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fetchOrders = async () => {
    if (!user?.uid) return
    try {
      const q = query(collection(db, 'orders'), where('sellerId', '==', user.uid), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [user])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter || o.type === filter)
  const completedOrders = orders.filter(o => o.status === 'delivered').length

  const getDaysSinceOrder = (createdAt) => {
    if (!createdAt?.toDate) return 0
    return Math.floor((Date.now() - createdAt.toDate().getTime()) / (1000 * 60 * 60 * 24))
  }

  const uploadShippingPhotoAndMark = async (orderId) => {
    if (!shippingPhoto) return showToast('Please select a photo first')
    setUploadingPhoto(true)
    try {
      const imgData = new FormData()
      imgData.append('image', shippingPhoto)
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_KEY}`, { method: 'POST', body: imgData })
      const imgJson = await res.json()
      const photoUrl = imgJson.data?.url || ''
      await updateDoc(doc(db, 'orders', orderId), { status: 'shipped', shippingPhotoUrl: photoUrl })
      setOrders(os => os.map(o => o.id === orderId ? { ...o, status: 'shipped', shippingPhotoUrl: photoUrl } : o))
      setSelected(null)
      setShippingPhoto(null)
      showToast('Order marked as shipped with photo ✅')
    } catch (err) {
      showToast('Failed to upload photo. Try again.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const markDelivered = async (id) => {
    await updateDoc(doc(db, 'orders', id), { status: 'delivered' })
    setOrders(os => os.map(o => o.id === id ? { ...o, status: 'delivered' } : o))
    showToast('Order marked as delivered!')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg2)' }}>
      <Navbar variant="dashboard" />
      {toast && <div className="toast success">{toast}</div>}
      <div style={{ padding: '5rem 5% 3rem' }}>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.2rem' }}>Orders</div>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>{orders.length} total orders</p>
        </div>

        {completedOrders > 0 && (
          <div style={{ background: 'var(--green-soft)', border: '1px solid rgba(0,168,120,0.2)', borderRadius: '10px', padding: '0.9rem 1.2rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: 'var(--light)' }}>
            💰 <strong>Payout info:</strong> {completedOrders < 20
              ? `Complete ${20 - completedOrders} more order${20 - completedOrders !== 1 ? 's' : ''} to unlock 30% upfront payouts.`
              : '🎉 You qualify for 30% upfront payouts! Contact Venda support to set it up.'}
          </div>
        )}

        <div style={{ background: 'rgba(214,158,46,0.08)', border: '1px solid rgba(214,158,46,0.2)', borderRadius: '10px', padding: '0.9rem 1.2rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: 'var(--light)' }}>
          📦 <strong>Shipping reminder:</strong> Please ship orders within 5 days of receiving them. Upload a photo of the packaged item before dispatch.
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['all', 'pending', 'shipped', 'delivered', 'physical', 'digital'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.4rem 0.9rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, border: '1.5px solid', borderColor: filter === f ? 'var(--green)' : 'var(--border)', background: filter === f ? 'var(--green-soft)' : 'transparent', color: filter === f ? 'var(--green)' : 'var(--muted)', cursor: 'pointer', textTransform: 'capitalize' }}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
            <div style={{ color: 'var(--muted)' }}>No orders yet</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {filtered.map(o => {
              const daysSince = getDaysSinceOrder(o.createdAt)
              const isLate = o.status === 'pending' && o.type === 'physical' && daysSince >= 5
              return (
                <div key={o.id} className="card" onClick={() => setSelected(o)} style={{ cursor: 'pointer' }}>
                  {isLate && (
                    <div style={{ background: 'rgba(214,158,46,0.1)', border: '1px solid rgba(214,158,46,0.25)', borderRadius: '6px', padding: '0.5rem 0.75rem', marginBottom: '0.75rem', fontSize: '0.78rem', color: 'var(--warning)', fontWeight: 600 }}>
                      ⚠️ {daysSince} days old — please ship soon!
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.5rem' }}>{o.type === 'digital' ? '💻' : '📦'}</span>
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: '0.15rem' }}>{o.productName}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{o.buyerName} · {o.createdAt?.toDate?.()?.toLocaleDateString('en-NG') || 'N/A'}</div>
                        {o.type === 'physical' && o.deliveryAddress && <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.2rem' }}>📍 {o.deliveryAddress}</div>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--green)', fontSize: '1rem' }}>₦{o.amount?.toLocaleString()}</div>
                      <span className={`badge ${o.status === 'delivered' ? 'badge-green' : o.status === 'shipped' ? 'badge-green' : 'badge-yellow'}`}>{o.status}</span>
                    </div>
                  </div>
                  {o.status === 'pending' && o.type === 'physical' && (
                    <div style={{ marginTop: '0.9rem', paddingTop: '0.9rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => { setSelected(o); setShippingPhoto(null) }} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>📸 Upload & Ship</button>
                      {o.buyerPhone && <a href={`https://wa.me/${o.buyerPhone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>WhatsApp Buyer</a>}
                    </div>
                  )}
                  {o.status === 'shipped' && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => markDelivered(o.id)} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>✅ Mark as Delivered</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Order detail / shipping photo modal */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Order Details</div>
                <button onClick={() => { setSelected(null); setShippingPhoto(null) }} style={{ fontSize: '1.2rem', color: 'var(--muted)', cursor: 'pointer', background: 'none', border: 'none' }}>✕</button>
              </div>
              {[
                ['Order ID', selected.orderId || selected.id.slice(0,8).toUpperCase()],
                ['Product', selected.productName],
                ['Amount', `₦${selected.amount?.toLocaleString()}`],
                ['Buyer', selected.buyerName],
                ['Email', selected.buyerEmail],
                ['Phone', selected.buyerPhone || 'N/A'],
                ['Type', selected.type],
                ['Status', selected.status],
                ['Date', selected.createdAt?.toDate?.()?.toLocaleDateString('en-NG') || 'N/A'],
                ...(selected.deliveryAddress ? [['Delivery Address', selected.deliveryAddress]] : []),
                ...(selected.note ? [['Note', selected.note]] : []),
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--muted)' }}>{k}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' }}>{v}</span>
                </div>
              ))}

              {selected.shippingPhotoUrl && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>Shipping photo:</div>
                  <img src={selected.shippingPhotoUrl} alt="Shipping" style={{ width: '100%', borderRadius: '8px', maxHeight: '200px', objectFit: 'cover' }} />
                </div>
              )}

              {selected.status === 'pending' && selected.type === 'physical' && (
                <div style={{ marginTop: '1.2rem', padding: '1rem', background: 'var(--bg2)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>📸 Upload shipping photo before dispatch</div>
                  <div style={{ border: '2px dashed var(--border)', borderRadius: '8px', padding: '1rem', textAlign: 'center', cursor: 'pointer', marginBottom: '0.75rem' }} onClick={() => document.getElementById('shipping-photo').click()}>
                    {shippingPhoto ? <div style={{ color: 'var(--green)', fontSize: '0.85rem', fontWeight: 600 }}>✓ {shippingPhoto.name}</div> : <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Tap to upload photo</div>}
                  </div>
                  <input id="shipping-photo" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setShippingPhoto(e.target.files[0])} />
                  <button onClick={() => uploadShippingPhotoAndMark(selected.id)} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={uploadingPhoto || !shippingPhoto}>
                    {uploadingPhoto ? 'Uploading...' : 'Upload & Mark as Shipped'}
                  </button>
                </div>
              )}

              <button onClick={() => { setSelected(null); setShippingPhoto(null) }} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
