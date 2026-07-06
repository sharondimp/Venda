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
        const productsQ = query(collection(db, 'products'), where('sellerId', '==', sellerData.id), where('status', '==', 'active'))
        const productsSnap = await getDocs(productsQ)
        setProducts(productsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
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

  if (loading) return (
    <div className="page-loader"><div className="spinner" /></div>
  )

  if (!store) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', background: 'var(--bg)' }}>
      <div style={{ fontSize: '3rem' }}>🔍</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>Store not found</div>
      <Link to="/marketplace" className="btn-primary">Browse Stores</Link>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <div style={{ background: theme === 'dark' ? 'rgba(14,14,14,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', padding: '0 5%', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link to="/marketplace" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)', textDecoration: 'none' }}>
          Ven<span style={{ color: 'var(--green)' }}>da</span>
        </Link>
        <button onClick={toggleTheme} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '50px', padding: '0.3rem 0.8rem', fontSize: '0.8rem', color: 'var(--text)', cursor: 'pointer' }}>
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>

      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0a3d2e 0%, #00A878 100%)', padding: '3rem 5% 2.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />

        {store.logoUrl ? (
          <img src={store.logoUrl} alt={store.storeName} style={{ width: '88px', height: '88px', borderRadius: '18px', objectFit: 'cover', margin: '0 auto 1rem', display: 'block', border: '3px solid rgba(255,255,255,0.4)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }} />
        ) : (
          <div style={{ width: '88px', height: '88px', borderRadius: '18px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff', fontSize: '2.2rem', margin: '0 auto 1rem', border: '3px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
            {store.storeName?.[0]}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{store.storeName}</h1>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.3)' }}>✓ VERIFIED</span>
          {store.plan === 'premium' && <span style={{ background: 'rgba(255,215,0,0.25)', color: '#FFD700', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '50px', border: '1px solid rgba(255,215,0,0.4)' }}>⭐ PREMIUM</span>}
          <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.72rem', padding: '0.25rem 0.65rem', borderRadius: '50px' }}>
            {store.productType === 'physical' ? '📦 Physical' : store.productType === 'digital' ? '💻 Digital' : '🛍️ Physical & Digital'}
          </span>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>{store.storeDesc}</p>
      </div>

      {/* Stats bar */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '0.75rem 5%', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--text)' }}>{products.length}</strong> product{products.length !== 1 ? 's' : ''}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
          🔒 Secure payments via Paystack
        </div>
      </div>

      <div style={{ padding: '2rem 5%' }}>
        {/* Search + filter */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: '180px' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{ paddingLeft: '2.2rem' }} />
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem' }}>🔍</span>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[['all','All'], ['physical','📦'], ['digital','💻']].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)} style={{ padding: '0.5rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, border: '1.5px solid', borderColor: filter === val ? 'var(--green)' : 'var(--border)', background: filter === val ? 'var(--green-soft)' : 'var(--card)', color: filter === val ? 'var(--green)' : 'var(--muted)', cursor: 'pointer', transition: 'all 0.2s' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
            <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>No products found</div>
            <div style={{ fontSize: '0.875rem' }}>Try a different search or filter</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {filtered.map(p => (
              <div key={p.id} className="card" style={{ padding: '0', overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}>
                {/* Product image */}
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ height: '160px', background: 'linear-gradient(135deg, var(--bg2) 0%, var(--bg3) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                    {p.type === 'digital' ? '💻' : '📦'}
                  </div>
                )}
                <div style={{ padding: '0.9rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'var(--green-soft)', color: 'var(--green)', border: '1px solid rgba(0,168,120,0.2)', marginBottom: '0.45rem', display: 'inline-block' }}>
                    {p.type === 'digital' ? '💻 Digital' : '📦 Physical'}
                  </span>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem', fontFamily: 'var(--font-display)', fontSize: '0.9rem', lineHeight: 1.3 }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.7rem', lineHeight: 1.4 }}>{p.description?.slice(0, 50)}{p.description?.length > 50 ? '...' : ''}</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--green)', fontSize: '1rem' }}>₦{p.price?.toLocaleString()}</div>
                    <Link to={`/checkout/${storeSlug}/${p.id}`} className="btn-primary" style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', borderRadius: '6px' }}>Buy</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '3rem', padding: '1.5rem 0', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
            Powered by <Link to="/" style={{ color: 'var(--green)', fontWeight: 600 }}>Venda</Link> · Real sellers. Real products. · <Link to="/dispute" style={{ color: 'var(--muted)' }}>Report an issue</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
