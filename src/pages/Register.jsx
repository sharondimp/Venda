import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import Navbar from '../components/Navbar'

const STEPS = ['Account', 'Store Info', 'Product Type', 'Verification']
const ADMIN_EMAIL = 'sharonadelaja186@gmail.com'

export default function Register() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    storeName: '', storeDesc: '', storeSlug: '',
    productType: '', nin: '', ninPhoto: null
  })

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const validateStep = () => {
    setError('')
    if (step === 0) {
      if (!form.fullName || !form.email || !form.password || !form.confirmPassword) return setError('All fields are required') || false
      if (form.password !== form.confirmPassword) return setError('Passwords do not match') || false
      if (form.password.length < 6) return setError('Password must be at least 6 characters') || false
    }
    if (step === 1) {
      if (!form.storeName || !form.storeDesc || !form.storeSlug) return setError('All fields are required') || false
    }
    if (step === 2) {
      if (!form.productType) return setError('Please select what you sell') || false
    }
    if (step === 3) {
      if (!form.nin) return setError('NIN is required') || false
      if (form.nin.length !== 11) return setError('NIN must be 11 digits') || false
      if (!form.ninPhoto) return setError('Please upload your NIN card photo') || false
    }
    return true
  }

  const next = () => { if (validateStep()) setStep(s => s + 1) }
  const back = () => { setError(''); setStep(s => s - 1) }

  const handleSubmit = async () => {
    if (!validateStep()) return
    setLoading(true)
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, form.email, form.password)
      const isAdmin = form.email === ADMIN_EMAIL
      await setDoc(doc(db, 'sellers', firebaseUser.uid), {
        fullName: form.fullName,
        email: form.email,
        storeName: form.storeName,
        storeSlug: form.storeSlug,
        storeDesc: form.storeDesc,
        productType: form.productType,
        nin: form.nin,
        plan: 'free',
        status: isAdmin ? 'approved' : 'pending',
        role: isAdmin ? 'admin' : 'seller',
        createdAt: serverTimestamp(),
      })
      navigate(isAdmin ? '/admin' : '/dashboard')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('An account with this email already exists')
      else setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const productTypes = [
    { id: 'physical', emoji: '📦', title: 'Physical Products', desc: 'Clothes, accessories, food, handmade items, beauty products' },
    { id: 'digital', emoji: '💻', title: 'Digital Products', desc: 'Ebooks, templates, presets, courses, graphics, music' },
    { id: 'both', emoji: '🛍️', title: 'Both', desc: 'I sell physical and digital products' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg2)' }}>
      <Navbar variant="public" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '5rem 5% 3rem' }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              {STEPS.map((s, i) => (
                <span key={s} style={{ fontSize: '0.72rem', fontWeight: 600, color: i <= step ? 'var(--blue)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s}</span>
              ))}
            </div>
            <div style={{ height: '4px', background: 'var(--bg3)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--blue), var(--teal))', borderRadius: '2px', width: `${((step + 1) / STEPS.length) * 100}%`, transition: 'width 0.3s' }} />
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.3rem' }}>{STEPS[step]}</div>
              <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                {step === 0 && 'Create your Dimpa account'}
                {step === 1 && 'Set up your store details'}
                {step === 2 && 'Tell us what you sell'}
                {step === 3 && 'Verify your identity to activate your store'}
              </p>
            </div>

            {error && <div style={{ background: 'rgba(229,62,62,0.08)', border: '1px solid rgba(229,62,62,0.2)', borderRadius: '8px', padding: '0.7rem 1rem', marginBottom: '1.2rem', color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</div>}

            {step === 0 && (
              <div>
                <div className="form-group"><label className="form-label">Full Name</label><input value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="e.g. Amara Johnson" /></div>
                <div className="form-group"><label className="form-label">Email Address</label><input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" /></div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="At least 6 characters" style={{ paddingRight: '2.5rem' }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--muted)' }}>{showPassword ? '🙈' : '👁️'}</button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} placeholder="Repeat password" style={{ paddingRight: '2.5rem' }} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--muted)' }}>{showConfirmPassword ? '🙈' : '👁️'}</button>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <div className="form-group"><label className="form-label">Store Name</label><input value={form.storeName} onChange={e => { update('storeName', e.target.value); update('storeSlug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) }} placeholder="e.g. Tolu's Fashion Store" /></div>
                <div className="form-group">
                  <label className="form-label">Store URL</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg2)' }}>
                    <span style={{ padding: '0.7rem 0.8rem', fontSize: '0.82rem', color: 'var(--muted)', background: 'var(--bg3)', whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>dimpa.ng/store/</span>
                    <input value={form.storeSlug} onChange={e => update('storeSlug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))} placeholder="your-store" style={{ border: 'none', borderRadius: 0, background: 'transparent' }} />
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Store Description</label><textarea value={form.storeDesc} onChange={e => update('storeDesc', e.target.value)} placeholder="Tell buyers what your store is about..." rows={3} style={{ resize: 'vertical' }} /></div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {productTypes.map(pt => (
                  <div key={pt.id} onClick={() => update('productType', pt.id)} style={{ border: `2px solid ${form.productType === pt.id ? 'var(--blue)' : 'var(--border)'}`, borderRadius: '10px', padding: '1rem 1.2rem', cursor: 'pointer', display: 'flex', gap: '1rem', alignItems: 'flex-start', background: form.productType === pt.id ? 'rgba(26,47,212,0.05)' : 'var(--card)', transition: 'all 0.2s' }}>
                    <span style={{ fontSize: '1.8rem' }}>{pt.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: '0.2rem', fontFamily: 'var(--font-display)' }}>{pt.title}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{pt.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {step === 3 && (
              <div>
                <div style={{ background: 'rgba(26,47,212,0.06)', border: '1px solid rgba(26,47,212,0.15)', borderRadius: '8px', padding: '0.9rem 1rem', marginBottom: '1.2rem', fontSize: '0.85rem', color: 'var(--blue)' }}>
                  🔒 Your NIN is used only for identity verification and is never shared with buyers.
                </div>
                <div className="form-group">
                  <label className="form-label">NIN (National Identification Number)</label>
                  <input value={form.nin} onChange={e => update('nin', e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="11-digit NIN" maxLength={11} />
                  <span className="form-hint">{form.nin.length}/11 digits</span>
                </div>
                <div className="form-group">
                  <label className="form-label">NIN Card / Slip Photo</label>
                  <div style={{ border: '2px dashed var(--border)', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: 'var(--bg2)' }} onClick={() => document.getElementById('nin-upload').click()}>
                    {form.ninPhoto ? <div style={{ color: 'var(--blue)', fontWeight: 600, fontSize: '0.9rem' }}>✓ {form.ninPhoto.name}</div> : <><div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>📷</div><div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Tap to upload a photo of your NIN card</div></>}
                  </div>
                  <input id="nin-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => update('ninPhoto', e.target.files[0])} />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.6 }}>Your store will be reviewed and activated within <strong>24 hours</strong>.</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'space-between' }}>
              {step > 0 ? <button onClick={back} className="btn-secondary" style={{ flex: 1 }}>← Back</button> : <div style={{ flex: 1 }} />}
              {step < STEPS.length - 1
                ? <button onClick={next} className="btn-primary" style={{ flex: 1 }}>Continue →</button>
                : <button onClick={handleSubmit} className="btn-primary" style={{ flex: 1 }} disabled={loading}>{loading ? 'Submitting...' : 'Submit Application'}</button>}
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 600 }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
