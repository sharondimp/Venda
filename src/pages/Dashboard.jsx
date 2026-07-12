import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AppContext'
import { db } from '../firebase'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const { user } = useAuth()
  const isPremium = user?.plan === 'premium'
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

        // Fetch products without status filter to avoid index issue
        const productsQ = query(collection(db, 'products'), where('sellerId', '==', user.uid))
        const productsSnap = await getDocs(productsQ)
        const allProducts = productsSnap.docs.map(d => d.data())
        const activeProducts = allProducts.filter(p => p.status !== 'inactive')

        const totalRevenue = ordersData.reduce((sum, o) => sum + (o.amount || 0), 0)
        setStats({ totalSales: ordersData.length, revenue: totalRevenue, products: activeProducts.length })
      } catch (err) {
        console.error('Dashboard fetch error:', err)
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
          <div style={{ background: 'rgba(214,158,46,0.1)', border: '1px solid rgba(214,158,46,0.25)', borderRadius: '10px', padding: '1rem 1.2rem', marginBottom: '2rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.2rem' }}>⏳</span>
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
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Here's what's happening with your store</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {!isPremium && <Link to="/dashboard/upgrade" className="btn-primary">⚡ Upgrade to Premium</Link>}
            <Link to={`/store/${user?.storeSlug}`} className="btn-secondary" target="_blank">View Store ↗</Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card">
            <div style={{ fontSize: '1.4rem', marginBottom: '0.6rem' }}>🛍️</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--green)', lineHeight: 1, marginBottom: '0.3rem' }}>{dataLoaded ? stats.totalSales : '—'}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Total Sales</div>
          </div>
          <div className="card">
            <div style={{ fontSize: '1.4rem', marginBottom: '0.6rem' }}>💰</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--green)', lineHeight: 1, marginBottom: '0.3rem' }}>₦{dataLoaded ? stats.revenue.toLocaleString() : '—'}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Revenue</div>
          </div>
          <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            {!isPremium && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius)', zIndex: 2, gap: '0.4rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🔒</span>
                <Link to="/dashboard/upgrade" style={{ fontSize: '0.72rem', color: 'var(--green)', fontWeight: 700, background: 'rgba(0,168,120,0.15)', padding: '0.25rem 0.6rem', borderRadius: '50px', border: '1px solid rgba(0,168,120,0.3)' }}>Upgrade to unlock</Link>
              </div>
            )}
            <div style={{ fontSize: '1.4rem', marginBottom: '0.6rem' }}>👀</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--green)', lineHeight: 1, marginBottom: '0.3rem' }}>0</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Store Views</div>
          </div>
          <div className="card">
            <div style={{ fontSize: '1.4rem', marginBottom: '0.6rem' }}>📦</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--green)', lineHeight: 1, marginBottom: '0.3rem' }}>{dataLoaded ? `${stats.products}${!isPremium ? '/5' : ''}` : '—'}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Products</div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>Recent Orders</div>
            <Link to="/dashboard/orders" style={{ fontSize: '0.82rem', color: 'var(--green)', fontWeight: 600 }}>View all →</Link>
          </div>
          {!dataLoaded ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontSize: '0.875rem' }}>Loading orders...</div>
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
                    {['Order ID', 'Buyer', 'Product', 'Amount', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.8rem', color: 'var(--muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 0.8rem', color: 'var(--muted)', fontWeight: 600 }}>{o.orderId || o.id.slice(0, 8).toUpperCase()}</td>
                      <td style={{ padding: '0.75rem 0.8rem' }}>{o.buyerName}</td>
                      <td style={{ padding: '0.75rem 0.8rem' }}>{o.productName}</td>
                      <td style={{ padding: '0.75rem 0.8rem', fontWeight: 600, color: 'var(--green)' }}>₦{o.amount?.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem 0.8rem' }}>
                        <span className={`badge ${o.status === 'delivered' ? 'badge-green' : 'badge-yellow'}`}>{o.status}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.8rem', color: 'var(--muted)' }}>{o.createdAt?.toDate?.()?.toLocaleDateString('en-NG') || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
          <Link to="/dashboard/products" className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.5rem' }}>📦</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Products</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Add or edit</div>
            </div>
          </Link>
          <Link to="/dashboard/orders" className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', textDecoration: 'none' }}>
            <span style={{ fontSize: '1.5rem' }}>📋</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Orders</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Track & manage</div>
            </div>
          </Link>
          <Link to="/dashboard/sponsored" className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', textDecoration: 'none', border: '1px solid rgba(232,106,26,0.25)', background: 'rgba(232,106,26,0.05)' }}>
            <span style={{ fontSize: '1.5rem' }}>⭐</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#E86A1A' }}>Feature a Product</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{isPremium ? '₦500 / 24hrs' : '₦1,000 / 24hrs'}</div>
            </div>
          </Link>
          {!isPremium && (
            <Link to="/dashboard/upgrade" className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', textDecoration: 'none', border: '1px solid rgba(0,168,120,0.25)', background: 'var(--green-soft)' }}>
              <span style={{ fontSize: '1.5rem' }}>⚡</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--green)' }}>Go Premium</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Unlock all features</div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
