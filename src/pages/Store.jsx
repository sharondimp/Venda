import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { db } from '../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useTheme } from '../context/AppContext'

export default function Store() {
  const { storeSlug } = useParams()
  const { theme, toggleTheme } = useTheme()
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const sellerQ = query(collection(db, 'sellers'), where('storeSlug', '==', storeSlug))
        const sellerSnap = await getDocs(sellerQ)
        if (sellerSnap.empty) { setLoading(false); return }
        const sellerData = { id: sellerSnap.docs[0].id, ...sellerSnap.docs[0].data() }
        setStore(sellerData)
        const productsQ = query(collection(db, 'products'), where('sellerId', '==', sellerData.id))
        const productsSnap = await getDocs(productsQ)
        setProducts(productsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.status !== 'inactive'))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStore()
  }, [storeSlug])

  const filtered = products.filter(p => {
    const matchFilter = filter === 'all' || p.type === filter
    const matchSearch = search === '' || p.name?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  if (loading) return null

  if (!store) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', background: 'var(--bg)' }}>
      <div style={{ fontSize: '3rem' }}>🔍</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>Store not found</div>
      <Link to="/marketplace" className="btn-primary">Browse Stores</Link>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>

      {/* Sticky Nav */}
      <div style={{ background: theme === 'dark' ? 'rgba(10,10,10,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '0 5%', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link to="/marketplace" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)', textDecoration: 'none' }}>
          Ven<span style={{ color: 'var(--blue)' }}>da</span>
        </Link>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {store.whatsapp && (
            <a href={`https://wa.me/${store.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>💬 Chat</a>
          )}
          <button onClick={toggleTheme} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '50px', padding: '0.3rem 0.8rem', fontSize: '0.78rem', color: 'var(--text)', cursor: 'pointer' }}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div style={{ background: theme === 'dark' ? 'linear-gradient(160deg, #0a2e1e 0%, #0d3d28 50%, #0a2e1e 100%)' : 'linear-gradient(160deg, #064e36 0%, #00A878 50%, #064e36 100%)', padding: '3.5rem 5% 2.5rem', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: '20px', left: '30%', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

        <div style={{ position: 'relative', textAlign: 'center' }}>
          {/* Logo */}
          <div style={{ marginBottom: '1.2rem' }}>
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.storeName} style={{ width: '96px', height: '96px', borderRadius: '24px', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', display: 'inline-block' }} />
            ) : (
              <div style={{ width: '96px', height: '96px', borderRadius: '24px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff', fontSize: '2.4rem', border: '3px solid rgba(255,255,255,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                {store.storeName?.[0]}
              </div>
            )}
          </div>

          {/* Store name + badges */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', fontWeight: 800, color: '#fff', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
            {store.storeName}
          </h1>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.7rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>✓ VERIFIED</span>
            {store.plan === 'premium' && <span style={{ background: 'rgba(255,215,0,0.2)', color: '#FFD700', fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.7rem', borderRadius: '50px', border: '1px solid rgba(255,215,0,0.35)', letterSpacing: '0.05em' }}>⭐ PREMIUM</span>}
            <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)', fontSize: '0.7rem', padding: '0.25rem 0.7rem', borderRadius: '50px' }}>
              {store.productType === 'physical' ? '📦 Physical' : store.productType === 'digital' ? '💻 Digital' : '🛍️ Physical & Digital'}
            </span>
          </div>

          {store.storeDesc && (
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto 1.2rem', lineHeight: 1.65 }}>{store.storeDesc}</p>
          )}

          {/* Social links */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {store.instagram && (
              <a href={`https://instagram.com/${store.instagram}`} target="_blank" rel="noreferrer" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.78rem', padding: '0.35rem 0.9rem', borderRadius: '50px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                📸 Instagram
              </a>
            )}
            {store.twitter && (
              <a href={`https://x.com/${store.twitter}`} target="_blank" rel="noreferrer" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.78rem', padding: '0.35rem 0.9rem', borderRadius: '50px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                𝕏 Twitter
              </a>
            )}
            {store.whatsapp && (
              <a href={`https://wa.me/${store.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.78rem', padding: '0.35rem 0.9rem', borderRadius: '50px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                💬 WhatsApp
              </a>
            )}
            {store.website && (
              <a href={store.website} target="_blank" rel="noreferrer" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.78rem', padding: '0.35rem 0.9rem', borderRadius: '50px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                🌐 Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '0.65rem 5%', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--text)' }}>{products.length}</strong> product{products.length !== 1 ? 's' : ''}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>🔒 Secure checkout via Paystack</div>
      </div>

      {/* Products section */}
      <div style={{ padding: '2rem 5%' }}>
        {/* Search + filter */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: '180px' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{ paddingLeft: '2.2rem', width: '100%' }} />
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem' }}>🔍</span>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[['all','All'], ['physical','📦'], ['digital','💻']].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)} style={{ padding: '0.5rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, border: '1.5px solid', borderColor: filter === val ? 'var(--blue)' : 'var(--border)', background: filter === val ? 'rgba(26,47,212,0.08)' : 'var(--card)', color: filter === val ? 'var(--blue)' : 'var(--muted)', cursor: 'pointer', transition: 'all 0.2s' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
            <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>No products found</div>
            <div style={{ fontSize: '0.875rem' }}>Try a different search or filter</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: '1rem' }}>
            {filtered.map(p => (
              <div key={p.id} style={{ background: 'var(--card)', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden', transition: 'all 0.22s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)'; e.currentTarget.style.borderColor = 'var(--blue)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)' }}>
                {/* Image */}
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '170px', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ height: '170px', background: 'linear-gradient(135deg, var(--bg2) 0%, var(--bg3) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                    {p.type === 'digital' ? '💻' : '📦'}
                  </div>
                )}
                <div style={{ padding: '0.9rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.18rem 0.5rem', borderRadius: '4px', background: 'rgba(26,47,212,0.08)', color: 'var(--blue)', border: '1px solid rgba(0,168,120,0.2)', marginBottom: '0.5rem', display: 'inline-block' }}>
                    {p.type === 'digital' ? '💻 Digital' : '📦 Physical'}
                  </span>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem', fontFamily: 'var(--font-display)', fontSize: '0.9rem', lineHeight: 1.3 }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginBottom: '0.7rem', lineHeight: 1.45 }}>{p.description?.slice(0, 55)}{p.description?.length > 55 ? '...' : ''}</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--blue)', fontSize: '1rem' }}>₦{p.price?.toLocaleString()}</div>
                    <Link to={`/checkout/${storeSlug}/${p.id}`} className="btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.76rem', borderRadius: '7px' }}>Buy</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '3rem', padding: '1.5rem 0', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
            Powered by <Link to="/" style={{ color: 'var(--blue)', fontWeight: 600 }}>Dimpa</Link> · Real sellers. Real products. · <Link to="/dispute" style={{ color: 'var(--muted)' }}>Report an issue</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
