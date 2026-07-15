import { useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

export default function Dispute() {
  const [form, setForm] = useState({ orderId: '', buyerName: '', buyerEmail: '', reason: '', description: '', photo: null })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }))

  const handleSubmit = async () => {
    setError('')
    if (!form.orderId || !form.buyerEmail || !form.reason || !form.description) return setError('Please fill in all required fields')
    if (!form.photo) return setError('Please upload a photo of the item')
    setLoading(true)
    try {
      // Upload photo to ImgBB
      let photoUrl = ''
      const imgData = new FormData()
      imgData.append('image', form.photo)
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_KEY}`, { method: 'POST', body: imgData })
      const imgJson = await res.json()
      photoUrl = imgJson.data?.url || ''

      await addDoc(collection(db, 'disputes'), {
        orderId: form.orderId,
        buyerName: form.buyerName,
        buyerEmail: form.buyerEmail,
        reason: form.reason,
        description: form.description,
        photoUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
      })
      setSuccess(true)
    } catch (err) {
      setError('Failed to submit. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>Dispute Submitted!</div>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>We've received your complaint and will review it within 24-48 hours. Check your email for updates.</p>
        <Link to="/" className="btn-primary" style={{ justifyContent: 'center', width: '100%' }}>Back to Home</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg2)' }}>
      <div style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '1rem 5%' }}>
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)', textDecoration: 'none' }}>
          Ven<span style={{ color: 'var(--blue)' }}>da</span>
        </Link>
      </div>

      <div style={{ padding: '3rem 5%', maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.3rem' }}>Report an Issue</div>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Not happy with your order? Let us know and we'll look into it.</p>
        </div>

        <div style={{ background: 'rgba(214,158,46,0.08)', border: '1px solid rgba(214,158,46,0.25)', borderRadius: '10px', padding: '0.9rem 1.2rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--light)' }}>
          ⚠️ Please note: Refunds are only considered if the item received is significantly different from what was described or is damaged. All claims must include a photo.
        </div>

        <div className="card" style={{ padding: '1.8rem' }}>
          {error && <div style={{ background: 'rgba(229,62,62,0.08)', border: '1px solid rgba(229,62,62,0.2)', borderRadius: '8px', padding: '0.7rem 1rem', marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</div>}

          <div className="form-group">
            <label className="form-label">Order ID *</label>
            <input value={form.orderId} onChange={e => update('orderId', e.target.value)} placeholder="e.g. VDA-928374" />
            <span className="form-hint">Check your order confirmation email</span>
          </div>
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input value={form.buyerName} onChange={e => update('buyerName', e.target.value)} placeholder="Your full name" />
          </div>
          <div className="form-group">
            <label className="form-label">Your Email *</label>
            <input type="email" value={form.buyerEmail} onChange={e => update('buyerEmail', e.target.value)} placeholder="The email you used to order" />
          </div>
          <div className="form-group">
            <label className="form-label">Reason *</label>
            <select value={form.reason} onChange={e => update('reason', e.target.value)}>
              <option value="">-- Select a reason --</option>
              <option value="wrong_item">Wrong item received</option>
              <option value="damaged">Item is damaged</option>
              <option value="not_delivered">Item not delivered</option>
              <option value="not_as_described">Item not as described</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Describe the issue *</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Tell us exactly what happened..." rows={4} style={{ resize: 'vertical' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Photo of item received *</label>
            <div style={{ border: '2px dashed var(--border)', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: 'var(--bg2)' }} onClick={() => document.getElementById('dispute-photo').click()}>
              {form.photo ? (
                <div style={{ color: 'var(--blue)', fontWeight: 600, fontSize: '0.9rem' }}>✓ {form.photo.name}</div>
              ) : (
                <>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>📸</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Tap to upload a clear photo of the item</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.3rem' }}>This is required to process your refund request</div>
                </>
              )}
            </div>
            <input id="dispute-photo" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => update('photo', e.target.files[0])} />
          </div>

          <button onClick={handleSubmit} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </div>
    </div>
  )
}
