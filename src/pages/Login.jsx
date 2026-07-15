import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import Navbar from '../components/Navbar'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resetting, setResetting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!email || !password) return setError('Please fill in all fields')
    setLoading(true)
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password)
      const docSnap = await getDoc(doc(db, 'sellers', firebaseUser.uid))
      if (docSnap.exists() && docSnap.data().role === 'admin') navigate('/admin')
      else navigate('/dashboard')
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') setError('Invalid email or password')
      else if (err.code === 'auth/user-not-found') setError('No account found with this email')
      else setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    setError(''); setSuccess('')
    if (!email) return setError('Please enter your email address first')
    setResetting(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setSuccess('Password reset email sent! Check your inbox.')
    } catch (err) {
      if (err.code === 'auth/user-not-found') setError('No account found with this email')
      else setError('Failed to send reset email. Try again.')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg2)', display: 'flex', flexDirection: 'column' }}>
      <Navbar variant="public" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 5% 3rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', marginBottom: '0.3rem' }}>Welcome back</div>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Log in to your Dimpa seller account</p>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            {error && <div style={{ background: 'rgba(229,62,62,0.08)', border: '1px solid rgba(229,62,62,0.2)', borderRadius: '8px', padding: '0.7rem 1rem', marginBottom: '1.2rem', color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</div>}
            {success && <div style={{ background: 'rgba(26,47,212,0.06)', border: '1px solid rgba(26,47,212,0.15)', borderRadius: '8px', padding: '0.7rem 1rem', marginBottom: '1.2rem', color: 'var(--blue)', fontSize: '0.85rem' }}>{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" style={{ paddingRight: '2.5rem' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--muted)' }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div style={{ textAlign: 'right', marginBottom: '1.2rem' }}>
                <button type="button" onClick={handleForgotPassword} disabled={resetting} style={{ fontSize: '0.82rem', color: 'var(--blue)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
                  {resetting ? 'Sending...' : 'Forgot password?'}
                </button>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }} disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--blue)', fontWeight: 600 }}>Start selling</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
