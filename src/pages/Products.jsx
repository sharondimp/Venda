import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AppContext'
import { db } from '../firebase'
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import Navbar from '../components/Navbar'

export default function Products() {
  const { user } = useAuth()
  const isPremium = user?.plan === 'premium'
  const productType = user?.productType || 'both'

  const [products, setProducts] = useState([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState({ name: '', price: '', type: productType === 'both' ? 'physical' : productType, description: '', stock: '', image: null })
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)

  const activeProducts = products.filter(p => p.status !== 'inactive')
  const maxProducts = isPremium ? Infinity : 5
  const canAdd = activeProducts.length < maxProducts

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fetchProducts = async () => {
    if (!user?.uid) return
    try {
      // Fetch without status filter to avoid needing composite index
      const q = query(collection(db, 'products'), where('sellerId', '==', user.uid))
      const snap = await getDocs(q)
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setDataLoaded(true)
    }
  }

  useEffect(() => { fetchProducts() }, [user])

  const openAdd = () => {
    setEditProduct(null)
    setForm({ name: '', price: '', type: productType === 'both' ? 'physical' : productType, description: '', stock: '', image: null })
    setError('')
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditProduct(p)
    setForm({ name: p.name, price: p.price, type: p.type, description: p.description || '', stock: p.stock || '', image: null })
    setError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    setError('')
    if (!form.name || !form.price) return setError('Name and price are required')
    setSaving(true)
    try {
      let imageUrl = editProduct?.imageUrl || ''
      if (form.image) {
        const imgData = new FormData()
        imgData.append('image', form.image)
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_KEY}`, { method: 'POST', body: imgData })
        const imgJson = await res.json()
        imageUrl = imgJson.data?.url || ''
      }

      const productData = {
        name: form.name,
        price: Number(form.price),
        type: form.type,
        description: form.description,
        stock: form.type === 'physical' ? Number(form.stock) || 0 : null,
        imageUrl,
        sellerId: user.uid,
        storeSlug: user.storeSlug,
        status: 'active',
      }

      if (editProduct) {
        await updateDoc(doc(db, 'products', editProduct.id), productData)
        showToast('Product updated!')
      } else {
        productData.createdAt = serverTimestamp()
        await addDoc(collection(db, 'products'), productData)
        showToast('Product added!')
      }
      await fetchProducts()
      setShowModal(false)
    } catch (err) {
      setError('Failed to save product. Try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    await deleteDoc(doc(db, 'products', id))
    setProducts(ps => ps.filter(p => p.id !== id))
    showToast('Product deleted')
  }

  const toggleStatus = async (product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active'
    await updateDoc(doc(db, 'products', product.id), { status: newStatus })
    setProducts(ps => ps.map(p => p.id === product.id ? { ...p, status: newStatus } : p))
  }

  const allowedTypes = productType === 'both'
    ? [{ value: 'physical', label: '📦 Physical' }, { value: 'digital', label: '💻 Digital' }]
    : productType === 'physical'
    ? [{ value: 'physical', label: '📦 Physical' }]
    : [{ value: 'digital', label: '💻 Digital' }]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg2)' }}>
      <Navbar variant="dashboard" />
      {toast && <div className="toast success">{toast}</div>}
      <div style={{ padding: '5rem 5% 3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.2rem' }}>Products</div>
            <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>{dataLoaded ? `${activeProducts.length}/${isPremium ? '∞' : '5'} products` : 'Loading...'}</p>
          </div>
          {canAdd ? (
            <button onClick={openAdd} className="btn-primary">+ Add Product</button>
          ) : (
            <Link to="/dashboard/upgrade" className="btn-primary">⚡ Upgrade to add more</Link>
          )}
        </div>

        {!isPremium && dataLoaded && (
          <div style={{ background: 'var(--green-soft)', border: '1px solid rgba(0,168,120,0.2)', borderRadius: '10px', padding: '0.9rem 1.2rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--light)' }}>Free plan — {5 - activeProducts.length} slot{5 - activeProducts.length !== 1 ? 's' : ''} left</span>
            <Link to="/dashboard/upgrade" style={{ fontSize: '0.82rem', color: 'var(--green)', fontWeight: 600 }}>Go Premium →</Link>
          </div>
        )}

        {!dataLoaded ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }} className="card">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📦</div>
            <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>No products yet</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: '1.2rem' }}>Add your first product to start selling</div>
            <button onClick={openAdd} className="btn-primary">+ Add Product</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {products.map(p => (
              <div key={p.id} className="card" style={{ opacity: p.status === 'inactive' ? 0.6 : 1 }}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.9rem' }} />
                ) : (
                  <div style={{ width: '100%', height: '160px', background: 'var(--bg3)', borderRadius: '8px', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                    {p.type === 'digital' ? '💻' : '📦'}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>{p.name}</div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <span className={`badge ${p.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{p.status || 'active'}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginBottom: '0.3rem', textTransform: 'capitalize' }}>{p.type}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--green)', marginBottom: '0.3rem' }}>₦{p.price?.toLocaleString()}</div>
                {p.type === 'physical' && <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.8rem' }}>Stock: {p.stock ?? 0}</div>}
                {p.type === 'digital' && <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '0.8rem' }}>Digital download</div>}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openEdit(p)} className="btn-secondary" style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem', justifyContent: 'center' }}>Edit</button>
                  <button onClick={() => toggleStatus(p)} className="btn-secondary" style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem', justifyContent: 'center' }}>{p.status === 'inactive' ? 'Show' : 'Hide'}</button>
                  <button onClick={() => deleteProduct(p.id)} style={{ padding: '0.45rem 0.7rem', borderRadius: '6px', background: 'rgba(229,62,62,0.08)', color: 'var(--danger)', fontSize: '0.8rem', border: '1px solid rgba(229,62,62,0.2)', cursor: 'pointer' }}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>{editProduct ? 'Edit Product' : 'Add Product'}</div>
                <button onClick={() => setShowModal(false)} style={{ fontSize: '1.2rem', color: 'var(--muted)', cursor: 'pointer', background: 'none', border: 'none' }}>✕</button>
              </div>
              {error && <div style={{ background: 'rgba(229,62,62,0.08)', border: '1px solid rgba(229,62,62,0.2)', borderRadius: '8px', padding: '0.7rem 1rem', marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</div>}
              {productType === 'both' && (
                <div className="form-group">
                  <label className="form-label">Product Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {allowedTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Blue Ankara Dress" />
              </div>
              <div className="form-group">
                <label className="form-label">Price (₦)</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 5000" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe your product..." rows={3} style={{ resize: 'vertical' }} />
              </div>
              {form.type === 'physical' && (
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="How many do you have?" />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Product Image</label>
                <div style={{ border: '2px dashed var(--border)', borderRadius: '10px', padding: '1.2rem', textAlign: 'center', cursor: 'pointer', background: 'var(--bg2)' }} onClick={() => document.getElementById('product-img').click()}>
                  {form.image ? <div style={{ color: 'var(--green)', fontWeight: 600, fontSize: '0.875rem' }}>✓ {form.image.name}</div> : <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>🖼 Tap to upload image</div>}
                </div>
                <input id="product-img" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setForm(f => ({ ...f, image: e.target.files[0] }))} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button onClick={handleSave} className="btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
