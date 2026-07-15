import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import Navbar from '../components/Navbar'

export default function Marketplace() {
  const [sellers, setSellers] = useState([])
  const [sponsored, setSponsored] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const q = query(collection(db, 'sellers'), where('status', '==', 'approved'), where('role', '==', 'seller'))
        const snap = await getDocs(q)
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setSponsored(all.filter(s => s.plan === 'premium' && s.sponsoredAds))
        setSellers([...all.filter(s => s.plan === 'premium' && !s.sponsoredAds), ...all.filter(s => s.plan !== 'premium')])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSellers()
  }, [])

  const filtered = sellers.filter(s => {
    const matchSearch = search === '' || s.storeName?.toLowerCase().includes(search.toLowerCase()) || s.storeDesc?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || s.productType === filter
    return matchSearch && matchFilter
  })

  const typeEmoji = (t) => t === 'physical' ? '📦' : t === 'digital' ? '💻' : '🛍️'

  const SellerCard = ({ s, isAd }) => (
    <Link to={`/store/${s.storeSlug}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ transition: 'all 0.2s', height: '100%', border: isAd ? '1.5px solid rgba(26,47,212,0.25)' : '1px solid var(--border)', background: isAd ? 'rgba(26,47,212,0.02)' : 'var(--card)' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(26,47,212,0.12)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.9rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--blue)', fontSize: '1.2rem' }}>
            {s.logoUrl ? <img src={s.logoUrl} alt={s.storeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : s.storeName?.[0]}
          </div>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {isAd && <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(26,47,212,0.1)', color: 'var(--blue)', border: '1px solid rgba(26,47,212,0.2)' }}>AD</span>}
            {s.plan === 'premium' && <span className="badge badge-blue">⭐ Pro</span>}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text)' }}>{s.storeName}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>{s.storeDesc?.slice(0, 80)}{s.storeDesc?.length > 80 ? '...' : ''}</div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className="badge badge-teal">✓ Verified</span>
          <span className="badge badge-gray">{typeEmoji(s.productType)} {s.productType}</span>
        </div>
      </div>
    </Link>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar variant="public" />
      <div style={{ paddingTop: '64px' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--blue-dark) 0%, var(--blue-dim) 100%)', padding: '3.5rem 5%', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Shop on Dimpa</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Every seller is verified. Shop with confidence.</p>
          <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for stores or products..." style={{ width: '100%', padding: '0.85rem 1.2rem 0.85rem 3rem', borderRadius: '10px', border: 'none', fontSize: '0.95rem', background: '#fff', color: '#111', outline: 'none' }} />
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
          </div>
        </div>

        <div style={{ padding: '2.5rem 5%' }}>
          {sponsored.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Sponsored</span>
                <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {sponsored.map(s => <SellerCard key={s.id} s={s} isAd />)}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[['all','All Stores'],['physical','📦 Physical'],['digital','💻 Digital'],['both','🛍️ Both']].map(([val, label]) => (
                <button key={val} onClick={() => setFilter(val)} style={{ padding: '0.4rem 0.9rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, border: '1.5px solid', borderColor: filter === val ? 'var(--blue)' : 'var(--border)', background: filter === val ? 'rgba(26,47,212,0.08)' : 'transparent', color: filter === val ? 'var(--blue)' : 'var(--muted)', cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{filtered.length} store{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>Loading stores...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
              <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>No stores found</div>
              <div style={{ fontSize: '0.875rem' }}>Try a different search or filter</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {filtered.map(s => <SellerCard key={s.id} s={s} isAd={false} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
