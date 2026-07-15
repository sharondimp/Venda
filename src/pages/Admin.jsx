import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AppContext'
import { db } from '../firebase'
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore'
import Navbar from '../components/Navbar'

export default function Admin() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalSellers: 0, pendingVerification: 0, premiumSellers: 0, totalOrders: 0 })
  const [recentSellers, setRecentSellers] = useState([])
  const [sponsoredAds, setSponsoredAds] = useState([])
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [toast, setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sellersSnap = await getDocs(query(collection(db, 'sellers'), where('role', '==', 'seller')))
        const sellers = sellersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        const ordersSnap = await getDocs(collection(db, 'orders'))
        const adsSnap = await getDocs(collection(db, 'sponsoredAds'))
        const disputesSnap = await getDocs(collection(db, 'disputes'))

        setStats({
          totalSellers: sellers.length,
          pendingVerification: sellers.filter(s => s.status === 'pending').length,
          premiumSellers: sellers.filter(s => s.plan === 'premium').length,
          totalOrders: ordersSnap.size,
        })
        setRecentSellers(sellers.slice(0, 5))
        setSponsoredAds(adsSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.date || '').localeCompare(a.date || '')))
        setDisputes(disputesSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const updateAdStatus = async (id, status) => {
    await updateDoc(doc(db, 'sponsoredAds', id), { status })
    setSponsoredAds(ads => ads.map(a => a.id === id ? { ...a, status } : a))
    showToast(status === 'approved' ? 'Ad approved!' : 'Ad rejected')
  }

  const updateDisputeStatus = async (id, status) => {
    await updateDoc(doc(db, 'disputes', id), { status })
    setDisputes(ds => ds.map(d => d.id === id ? { ...d, status } : d))
    showToast(`Dispute marked as ${status}`)
  }

  const pendingAds = sponsoredAds.filter(a => a.status === 'pending').length
  const pendingDisputes = disputes.filter(d => d.status === 'pending').length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg2)' }}>
      <Navbar variant="admin" />
      {toast && <div className="toast success">{toast}</div>}
      <div style={{ paddingTop: '64px', padding: '5rem 5% 3rem' }}>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.2rem' }}>Admin Dashboard</div>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Welcome back, {user?.fullName} 👋</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
          {[
            ['overview', 'Overview'],
            ['sponsored', `⭐ Featured ${pendingAds > 0 ? `(${pendingAds})` : ''}`],
            ['disputes', `🚨 Disputes ${pendingDisputes > 0 ? `(${pendingDisputes})` : ''}`],
          ].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '0.6rem 1.2rem', fontWeight: 600, fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', color: tab === t ? 'var(--blue)' : 'var(--muted)', borderBottom: tab === t ? '2px solid var(--blue)' : '2px solid transparent', marginBottom: '-1px', whiteSpace: 'nowrap' }}>
              {l}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Total Sellers', value: loading ? '...' : stats.totalSellers, icon: '👥' },
                { label: 'Pending NIN', value: loading ? '...' : stats.pendingVerification, icon: '⏳', color: 'var(--warning)' },
                { label: 'Premium', value: loading ? '...' : stats.premiumSellers, icon: '⭐', color: 'var(--blue)' },
                { label: 'Total Orders', value: loading ? '...' : stats.totalOrders, icon: '🛍️' },
                { label: 'Pending Ads', value: loading ? '...' : pendingAds, icon: '📢', color: pendingAds > 0 ? 'var(--warning)' : 'var(--text)' },
              ].map(s => (
                <div key={s.label} className="card">
                  <div style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: s.color || 'var(--blue)', lineHeight: 1, marginBottom: '0.3rem' }}>{s.value}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {stats.pendingVerification > 0 && (
              <div style={{ background: 'rgba(214,158,46,0.08)', border: '1px solid rgba(214,158,46,0.25)', borderRadius: '10px', padding: '1rem 1.2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span>⏳</span>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--warning)' }}>{stats.pendingVerification} seller{stats.pendingVerification !== 1 ? 's' : ''} waiting for verification</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Review NIN submissions</div>
                  </div>
                </div>
                <Link to="/admin/sellers" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>Review →</Link>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <Link to="/admin/sellers" className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', textDecoration: 'none' }}>
                <span style={{ fontSize: '1.5rem' }}>👥</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Manage Sellers</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Verify, approve, manage</div>
                </div>
              </Link>
              <Link to="/admin/sellers?tab=email" className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', textDecoration: 'none' }}>
                <span style={{ fontSize: '1.5rem' }}>📧</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Email Sellers</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Send announcements</div>
                </div>
              </Link>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Recent Sellers</div>
                <Link to="/admin/sellers" style={{ fontSize: '0.82rem', color: 'var(--blue)', fontWeight: 600 }}>View all →</Link>
              </div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>Loading...</div>
              ) : recentSellers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>No sellers yet</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Seller', 'Store', 'Plan', 'Status'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.8rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentSellers.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.75rem 0.8rem' }}>
                            <div style={{ fontWeight: 600 }}>{s.fullName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{s.email}</div>
                          </td>
                          <td style={{ padding: '0.75rem 0.8rem' }}>{s.storeName}</td>
                          <td style={{ padding: '0.75rem 0.8rem' }}><span className={`badge ${s.plan === 'premium' ? 'badge-teal' : 'badge-gray'}`}>{s.plan}</span></td>
                          <td style={{ padding: '0.75rem 0.8rem' }}><span className={`badge ${s.status === 'approved' ? 'badge-teal' : s.status === 'pending' ? 'badge-yellow' : 'badge-red'}`}>{s.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* SPONSORED TAB */}
        {tab === 'sponsored' && (
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.2rem' }}>Featured Product Submissions</div>
            {sponsoredAds.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
                <div>No featured post submissions yet</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {sponsoredAds.map(a => (
                  <div key={a.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{a.productName}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>{a.storeName} · 📅 {a.date}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>₦{a.amount?.toLocaleString()} paid · {a.sellerEmail}</div>
                        {a.note && <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontStyle: 'italic', marginBottom: '0.4rem' }}>"{a.note}"</div>}
                        <span className={`badge ${a.status === 'approved' ? 'badge-teal' : a.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>{a.status}</span>
                      </div>
                      {a.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => updateAdStatus(a.id, 'approved')} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>✓ Approve</button>
                          <button onClick={() => updateAdStatus(a.id, 'rejected')} className="btn-danger" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem', borderRadius: '8px' }}>✕ Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DISPUTES TAB */}
        {tab === 'disputes' && (
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.2rem' }}>Buyer Disputes & Refund Requests</div>
            {disputes.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
                <div>No disputes yet</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {disputes.map(d => (
                  <div key={d.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Order: {d.orderId}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.2rem' }}>{d.buyerName} · {d.buyerEmail}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.4rem' }}>Reason: {d.reason?.replace(/_/g, ' ')}</div>
                        <div style={{ fontSize: '0.85rem', marginBottom: '0.6rem' }}>{d.description}</div>
                        {d.photoUrl && (
                          <a href={d.photoUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: 'var(--blue)', fontWeight: 600 }}>📸 View Photo →</a>
                        )}
                        <div style={{ marginTop: '0.5rem' }}>
                          <span className={`badge ${d.status === 'resolved' ? 'badge-teal' : d.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>{d.status}</span>
                        </div>
                      </div>
                      {d.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button onClick={() => updateDisputeStatus(d.id, 'resolved')} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>✓ Approve Refund</button>
                          <button onClick={() => updateDisputeStatus(d.id, 'rejected')} className="btn-danger" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem', borderRadius: '8px' }}>✕ Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
