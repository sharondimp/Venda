import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme, useAuth } from '../context/AppContext'

export default function Navbar({ variant = 'public' }) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 5%', height: '64px',
        background: theme === 'dark' ? 'rgba(14,14,14,0.92)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        transition: 'background 0.3s'
      }}>
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.03em', color: 'var(--text)', textDecoration: 'none' }}>
          Ven<span style={{ color: 'var(--green)' }}>da</span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: '1.6rem', alignItems: 'center' }} className="desk-nav">
          {variant === 'public' && <>
            <a href="#how" style={{ color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>How it works</a>
            <a href="#products" style={{ color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>Products</a>
            <a href="#why" style={{ color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>Why Venda</a>
          </>}
          {variant === 'dashboard' && <>
            <Link to="/dashboard" style={{ color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>Overview</Link>
            <Link to="/dashboard/products" style={{ color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>Products</Link>
            <Link to="/dashboard/orders" style={{ color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>Orders</Link>
            <Link to="/dashboard/settings" style={{ color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>Settings</Link>
          </>}
          {variant === 'admin' && <>
            <Link to="/admin" style={{ color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>Overview</Link>
            <Link to="/admin/sellers" style={{ color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>Sellers</Link>
          </>}
        </nav>

        {/* Desktop right buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }} className="desk-nav">
          {variant === 'public' && !user && <>
            <Link to="/login" style={{ color: 'var(--text)', padding: '0.42rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', border: '1.5px solid var(--border)', textDecoration: 'none' }}>Log in</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '0.42rem 1rem', fontSize: '0.875rem' }}>Start Selling</Link>
          </>}
          {user && <button onClick={handleLogout} style={{ color: 'var(--text)', padding: '0.42rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', border: '1.5px solid var(--border)', background: 'none', cursor: 'pointer' }}>Log out</button>}
        </div>

        {/* Hamburger — mobile only */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mob-menu-btn"
          style={{ flexDirection: 'column', gap: '5px', padding: '6px', background: 'none', border: 'none', cursor: 'pointer', display: 'none' }}
        >
          <span style={{ display: 'block', width: '22px', height: '2px', background: 'var(--text)', borderRadius: '2px', transition: 'all 0.3s', transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
          <span style={{ display: 'block', width: '22px', height: '2px', background: 'var(--text)', borderRadius: '2px', transition: 'all 0.3s', opacity: menuOpen ? 0 : 1 }} />
          <span style={{ display: 'block', width: '22px', height: '2px', background: 'var(--text)', borderRadius: '2px', transition: 'all 0.3s', transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
        </button>
      </header>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 999,
          background: 'var(--bg)', borderBottom: '1px solid var(--border)',
          padding: '1rem 5% 1.5rem', display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
        }}>
          {variant === 'public' && <>
            <a href="#how" onClick={() => setMenuOpen(false)} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 500, textDecoration: 'none' }}>How it works</a>
            <a href="#products" onClick={() => setMenuOpen(false)} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 500, textDecoration: 'none' }}>Products</a>
            <a href="#why" onClick={() => setMenuOpen(false)} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 500, textDecoration: 'none' }}>Why Venda</a>
            {!user && <Link to="/login" onClick={() => setMenuOpen(false)} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 500, textDecoration: 'none' }}>Log in</Link>}
            {!user && <Link to="/register" onClick={() => setMenuOpen(false)} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)', color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>Start Selling</Link>}
          </>}
          {variant === 'dashboard' && <>
            <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 500, textDecoration: 'none' }}>Overview</Link>
            <Link to="/dashboard/products" onClick={() => setMenuOpen(false)} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 500, textDecoration: 'none' }}>Products</Link>
            <Link to="/dashboard/orders" onClick={() => setMenuOpen(false)} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 500, textDecoration: 'none' }}>Orders</Link>
            <Link to="/dashboard/settings" onClick={() => setMenuOpen(false)} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 500, textDecoration: 'none' }}>⚙️ Settings</Link>
            <Link to="/dashboard/upgrade" onClick={() => setMenuOpen(false)} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)', color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>⚡ Upgrade</Link>
          </>}
          {variant === 'admin' && <>
            <Link to="/admin" onClick={() => setMenuOpen(false)} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 500, textDecoration: 'none' }}>Overview</Link>
            <Link to="/admin/sellers" onClick={() => setMenuOpen(false)} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 500, textDecoration: 'none' }}>Sellers</Link>
          </>}
          {user && <button onClick={() => { handleLogout(); setMenuOpen(false) }} style={{ padding: '0.75rem 0', color: 'var(--danger)', fontWeight: 600, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '1rem' }}>Log out</button>}

          {/* Dark mode toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', marginTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Dark mode</span>
            <div onClick={toggleTheme} style={{ width: '44px', height: '24px', borderRadius: '50px', cursor: 'pointer', background: theme === 'dark' ? 'var(--green)' : 'var(--bg3)', position: 'relative', transition: 'background 0.3s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', top: '3px', left: theme === 'dark' ? '23px' : '3px', transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desk-nav { display: none !important; }
          .mob-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}
