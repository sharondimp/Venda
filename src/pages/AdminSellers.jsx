import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore'
import emailjs from '@emailjs/browser'
import Navbar from '../components/Navbar'

export default function AdminSellers() {
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [emailModal, setEmailModal] = useState(false)
  const [emailForm, setEmailForm] = useState({ subject: '', body: '', target: 'all' })
  const [toast, setToast] = useState('')
  const [sending, setSending] = useState(false)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fetchSellers = async () => {
    try {
      const q = query(collection(db, 'sellers'), where('role', '==', 'seller'))
      const snap = await getDocs(q)
      setSellers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSellers() }, [])

  const filtered = filter === 'all' ? sellers : sellers.filter(s => s.status === filter)
  const pendingCount = sellers.filter(s => s.status === 'pending').length

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, 'sellers', id), { status })
    setSellers(ss => ss.map(s => s.id === id ? { ...s, status } : s))
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }))
    showToast(status === 'approved' ? 'Seller approved!' : status === 'rejected' ? 'Seller rejected' : 'Seller suspended')
  }

  const sendEmailBlast = async () => {
    if (!emailForm.subject || !emailForm.body) return showToast('Please fill in subject and message')
    setSending(true)
    try {
      const targets = sellers.filter(s => {
        if (emailForm.target === 'all') return true
        if (emailForm.target === 'free') return s.plan === 'free'
        if (emailForm.target === 'premium') return s.plan === 'premium'
        if (emailForm.target === 'approved') return s.status === 'approved'
        if (emailForm.target === 'pending') return s.status === 'pending'
        return true
      })
      // Send to each seller individually
      for (const seller of targets) {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_NEW_ORDER_TEMPLATE,
          { seller_name: seller.fullName, seller_email: seller.email, product_name: emailForm.subject, amount: '', order_id: '', buyer_email: 'dimpateamapp@gmail.com', buyer_phone: '', is_digital: '', is_physical: '', delivery_address: emailForm.body },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        )
      }
      showToast(`Email sent to ${targets.length} seller${targets.length !== 1 ? 's' : ''}!`)
      setEmailModal(false)
      setEmailForm({ subject: '', body: '', target: 'all' })
    } catch (err) {
      showToast('Failed to send emails')
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg2)' }}>
      <Navbar variant="admin" />
      {toast && <div className="toast success">{toast}</div>}
      <div style={{ paddingTop: '64px', padding: '5rem 5% 3rem' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.2rem' }}>Sellers</div>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>{sellers.length} total · {pendingCount} pending</p>
          </div>
          <button onClick={() => setEmailModal(true)} className="btn-primary">📧 Email Sellers</button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.4rem 0.9rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, border: '1.5px solid', borderColor: filter === f ? 'var(--blue)' : 'var(--border)', background: filter === f ? 'rgba(26,47,212,0.08)' : 'transparent', color: filter === f ? 'var(--blue)' : 'var(--muted)', cursor: 'pointer', textTransform: 'capitalize' }}>
              {f} {f === 'pending' && pendingCount > 0 && <span style={{ background: 'var(--warning)', color: '#fff', borderRadius: '50px', padding: '0 5px', fontSize: '0.68rem', marginLeft: '2px' }}>{pendingCount}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>Loading sellers...</div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>No sellers found</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {filtered.map(s => (
              <div key={s.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(26,47,212,0.08)', border: '1px solid rgba(0,168,120,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--blue)', fontSize: '1rem', flexShrink: 0 }}>
                      {s.fullName?.[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: '0.15rem' }}>{s.fullName}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>{s.email}</div>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span className={`badge ${s.status === 'approved' ? 'badge-teal' : s.status === 'pending' ? 'badge-yellow' : 'badge-red'}`}>{s.status}</span>
                        <span className={`badge ${s.plan === 'premium' ? 'badge-teal' : 'badge-gray'}`}>{s.plan}</span>
                        <span className="badge badge-gray">{s.productType}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setSelected(s)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>View</button>
                    {s.status === 'pending' && <>
                      <button onClick={() => updateStatus(s.id, 'approved')} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>✓ Approve</button>
                      <button onClick={() => updateStatus(s.id, 'rejected')} className="btn-danger" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem', borderRadius: '8px' }}>✕ Reject</button>
                    </>}
                    {s.status === 'approved' && <button onClick={() => updateStatus(s.id, 'rejected')} className="btn-danger" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem', borderRadius: '8px' }}>Suspend</button>}
                    {s.status === 'rejected' && <button onClick={() => updateStatus(s.id, 'approved')} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>Re-approve</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Seller detail modal */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: '460px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>Seller Details</div>
                <button onClick={() => setSelected(null)} style={{ fontSize: '1.2rem', color: 'var(--muted)', cursor: 'pointer' }}>✕</button>
              </div>
              {[
                ['Full Name', selected.fullName],
                ['Store Name', selected.storeName],
                ['Store URL', `dimpa.app/store/${selected.storeSlug}`],
                ['Email', selected.email],
                ['Product Type', selected.productType],
                ['Plan', selected.plan],
                ['Status', selected.status],
                ['NIN', selected.nin],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--muted)' }}>{k}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: '1.2rem', background: 'var(--bg2)', borderRadius: '10px', padding: '1.2rem', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🪪</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.6rem' }}>NIN Card Photo submitted</div>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>View on Firebase Storage</span>
              </div>
              {selected.status === 'pending' && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button onClick={() => updateStatus(selected.id, 'approved')} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>✓ Approve</button>
                  <button onClick={() => updateStatus(selected.id, 'rejected')} className="btn-danger" style={{ flex: 1, justifyContent: 'center', borderRadius: '8px' }}>✕ Reject</button>
                </div>
              )}
              {selected.status !== 'pending' && (
                <button onClick={() => setSelected(null)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.2rem' }}>Close</button>
              )}
            </div>
          </div>
        )}

        {/* Email modal */}
        {emailModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>📧 Email Sellers</div>
                <button onClick={() => setEmailModal(false)} style={{ fontSize: '1.2rem', color: 'var(--muted)', cursor: 'pointer' }}>✕</button>
              </div>
              <div className="form-group">
                <label className="form-label">Send To</label>
                <select value={emailForm.target} onChange={e => setEmailForm(f => ({ ...f, target: e.target.value }))}>
                  <option value="all">All Sellers</option>
                  <option value="free">Free Plan Sellers</option>
                  <option value="premium">Premium Sellers</option>
                  <option value="approved">Approved Sellers</option>
                  <option value="pending">Pending Sellers</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input value={emailForm.subject} onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))} placeholder="Email subject" />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea value={emailForm.body} onChange={e => setEmailForm(f => ({ ...f, body: e.target.value }))} placeholder="Write your message..." rows={6} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setEmailModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button onClick={sendEmailBlast} className="btn-primary" style={{ flex: 1 }} disabled={sending}>{sending ? 'Sending...' : 'Send Email'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
