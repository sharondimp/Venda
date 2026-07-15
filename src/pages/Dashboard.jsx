import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AppContext'
import { db } from '../firebase'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const { user } = useAuth()
  const isPro = user?.plan === 'premium'
  const isPending = user?.status === 'pending'
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({ totalSales: 0, revenue: 0, products: 0 })
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    if (!user?.uid) return
    const fetchData = async () => {
      try {
        const ordersQ = query(collection(db, 'orders'), where('sellerId', '==', user.uid), orderBy('createdAt', 'desc'), limit(5))
        const ordersSnap = await getDocs(ordersQ)
        const ordersData = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        setOrders(ordersData)
        const productsQ = query(collection(db, 'products'), where('sellerId', '==', user.uid))
        const productsSnap = await getDocs(productsQ)
        const activeProducts = productsSnap.docs.map(d => d.data()).filter(p => p.status !== 'inactive')
        const totalRevenue = ordersData.reduce((sum, o) => sum + (o.amount || 0), 0)
        setStats({ totalSales: ordersData.length, revenue: totalRevenue, products: activeProducts.length })
      } catch (err) {
        console.error(err)
      } finally {
        setDataLoaded(true)
      }
    }
    fetchData()
  }, [user])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg2)' }}>
      <Navbar variant="dashboard" />
      <div style={{ padding: '5rem 5% 3rem' }}>

        {isPending && (
          <div style={{ background: 'rgba(214,158,46,0.08)', border: '1px solid rgba(214,158,46,0.2)', borderRadius: '10px', padding: '1rem 1.2rem', marginBottom: '2rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span>⏳</span>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--warning)', marginBottom: '0.2rem' }}>Verification pending</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Your NIN is being reviewed. Your store will go live within 24 hours.</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.2rem' }}>
              Hey, {user?.fullName?.split(' ')[0]} 👋
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Here's your store overview</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {!isPro && <Link to="/dashboard/upgrade" className="btn-primary">⚡ Go Pro</Link>}
            <Link to={`/store/${user?.storeSlug}`} className="btn-secondary" target="_blank">View Store ↗</Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { icon: '🛍️', value: dataLoaded ? stats.totalSales : '—', label: 'Total Sales' },
            { icon: '💰', value: `₦${dataLoaded ? stats.revenue.toLocaleString() : '—'}`, label: 'Revenue' },
            { icon: '📦', value: dataLoaded ? `${stats.products}${!isPro ? '/5' : ''}` : '—', label: 'Products' },
          ].map(s => (
            <div key={s.label} className="card">
              <div style={{ fontSize: '1.4rem', marginBottom: '0.6rem' }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--blue)', lineHeight: 1, marginBottom: '0.3rem' }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{s.label}</div>
            </div>
          ))}
          <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            {!isPro && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius)', zIndex: 2, gap: '0.4rem' }}>
                <span>🔒</span>
                <Link to="/dashboard/upgrade" style={{ fontSize: '0.72rem', color: 'var(--blue)', fontWeight: 700, background: 'rgba(26,47,212,0.15)', padding: '0.25rem 0.6rem', borderRadius: '50px', border: '1px solid rgba(26,47,212,0.3)' }}>Go Pro</Link>
              </div>
            )}
            <div style={{ fontSize: '1.4rem', marginBottom: '0.6rem' }}>👀</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--blue)', lineHeight: 1, marginBottom: '0.3rem' }}>0</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Store Views</div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>Recent Orders</div>
            <Link to="/dashboard/orders" style={{ fontSize: '0.82rem', color: 'var(--blue)', fontWeight: 600 }}>View all →</Link>
          </div>
          {!dataLoaded ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontSize: '0.875rem' }}>Loading...</div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
              <div>No orders yet</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Order ID', 'Buyer', 'Product', 'Amount', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.8rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 0.8rem', color: 'var(--muted)', fontWeight: 600 }}>{o.orderId || o.id.slice(0,8).toUpperCase()}</td>
                      <td style={{ padding: '0.75rem 0.8rem' }}>{o.buyerName}</td>
                      <td style={{ padding: '0.75rem 0.8rem' }}>{o.productName}</td>
                      <td style={{ padding: '0.75rem 0.8rem', fontWeight: 600, color: 'var(--blue)' }}>₦{o.amount?.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem 0.8rem' }}>
                        <span className={`badge ${o.status === 'delivered' ? 'badge-teal' : o.status === 'shipped' ? 'badge-blue' : 'badge-yellow'}`}>{o.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
          {[
            { to: '/dashboard/products', icon: '📦', title: 'Products', sub: 'Add or edit' },
            { to: '/dashboard/orders', icon: '📋', title: 'Orders', sub: 'Track & manage' },
            { to: '/dashboard/settings', icon: '⚙️', title: 'Store Settings', sub: 'Logo, delivery' },
            { to: '/dashboard/sponsored', icon: '⭐', title: 'Feature Product', sub: isPro ? '₦500/24hrs' : '₦1,000/24hrs', special: 'orange' },
            ...(!isPro ? [{ to: '/dashboard/upgrade', icon: '⚡', title: 'Go Pro', sub: 'Unlock all features', special: 'blue' }] : []),
          ].map(a => (
            <Link key={a.to} to={a.to} className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', textDecoration: 'none', ...(a.special === 'orange' ? { border: '1px solid rgba(232,106,26,0.25)', background: 'rgba(232,106,26,0.04)' } : a.special === 'blue' ? { border: '1px solid rgba(26,47,212,0.25)', background: 'rgba(26,47,212,0.04)' } : {}) }}>
              <span style={{ fontSize: '1.4rem' }}>{a.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: a.special === 'orange' ? '#E86A1A' : a.special === 'blue' ? 'var(--blue)' : 'var(--text)' }}>{a.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{a.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
