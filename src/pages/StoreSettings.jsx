import { useState, useEffect } from 'react'
import { useAuth } from '../context/AppContext'
import { db } from '../firebase'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import Navbar from '../components/Navbar'

export default function StoreSettings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)

  const [storeInfo, setStoreInfo] = useState({
    storeName: '',
    storeDesc: '',
    logoUrl: '',
    instagram: '',
    twitter: '',
    whatsapp: '',
    website: '',
  })

  const [deliveryZones, setDeliveryZones] = useState([])
  const [newZone, setNewZone] = useState({ location: '', price: '' })

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    if (!user?.uid) return
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'sellers', user.uid))
        if (docSnap.exists()) {
          const data = docSnap.data()
          setStoreInfo({
            storeName: data.storeName || '',
            storeDesc: data.storeDesc || '',
            logoUrl: data.logoUrl || '',
            instagram: data.instagram || '',
            twitter: data.twitter || '',
            whatsapp: data.whatsapp || '',
            website: data.website || '',
          })
          setDeliveryZones(data.deliveryZones || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [user])

  const handleLogoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const uploadLogo = async () => {
    if (!logoFile) return storeInfo.logoUrl
    setUploadingLogo(true)
    try {
      const imgData = new FormData()
      imgData.append('image', logoFile)
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_KEY}`, { method: 'POST', body: imgData })
      const json = await res.json()
      return json.data?.url || ''
    } catch (err) {
      console.error(err)
      return storeInfo.logoUrl
    } finally {
      setUploadingLogo(false)
    }
  }

  const saveStoreInfo = async () => {
    if (!storeInfo.storeName) return setError('Store name is required')
    setSaving(true)
    setError('')
    try {
      const logoUrl = logoFile ? await uploadLogo() : storeInfo.logoUrl
      await updateDoc(doc(db, 'sellers', user.uid), {
        storeName: storeInfo.storeName,
        storeDesc: storeInfo.storeDesc,
        logoUrl,
        instagram: storeInfo.instagram,
        twitter: storeInfo.twitter,
        whatsapp: storeInfo.whatsapp,
        website: storeInfo.website,
      })
      setStoreInfo(s => ({ ...s, logoUrl }))
      setLogoFile(null)
      showToast('Store info saved! ✅')
    } catch (err) {
      setError('Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const addZone = () => {
    if (!newZone.location || !newZone.price) return setError('Enter both location and price')
    setError('')
    setDeliveryZones(z => [...z, { location: newZone.location, price: Number(newZone.price) }])
    setNewZone({ location: '', price: '' })
  }

  const removeZone = (index) => {
    setDeliveryZones(z => z.filter((_, i) => i !== index))
  }

  const saveDeliveryZones = async () => {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'sellers', user.uid), { deliveryZones })
      showToast('Delivery zones saved! ✅')
    } catch (err) {
      setError('Failed to save delivery zones.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg2)' }}>
      <Navbar variant="dashboard" />
      <div style={{ padding: '5rem 5%', color: 'var(--muted)', textAlign: 'center' }}>Loading settings...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg2)' }}>
      <Navbar variant="dashboard" />
      {toast && <div className="toast success">{toast}</div>}
      <div style={{ padding: '5rem 5% 3rem', maxWidth: '640px', margin: '0 auto' }}>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.2rem' }}>Store Settings</div>
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Customize how your store looks and your delivery options</p>
        </div>

        {error && <div style={{ background: 'rgba(229,62,62,0.08)', border: '1px solid rgba(229,62,62,0.2)', borderRadius: '8px', padding: '0.7rem 1rem', marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</div>}

        {/* Store Logo */}
        <div className="card" style={{ padding: '1.8rem', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1.2rem' }}>Store Logo</div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '18px', overflow: 'hidden', border: '2px solid var(--border)', background: 'var(--bg3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--blue)' }}>
              {logoPreview || storeInfo.logoUrl ? (
                <img src={logoPreview || storeInfo.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.storeName?.[0]
              )}
            </div>
            <div>
              <button onClick={() => document.getElementById('logo-upload').click()} className="btn-secondary" style={{ marginBottom: '0.5rem', display: 'block' }}>
                {uploadingLogo ? 'Uploading...' : '📷 Upload Logo'}
              </button>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Recommended: square image, at least 200x200px</div>
              <input id="logo-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoSelect} />
            </div>
          </div>
        </div>

        {/* Store Info */}
        <div className="card" style={{ padding: '1.8rem', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1.2rem' }}>Store Info</div>
          <div className="form-group">
            <label className="form-label">Store Name</label>
            <input value={storeInfo.storeName} onChange={e => setStoreInfo(s => ({ ...s, storeName: e.target.value }))} placeholder="Your store name" />
          </div>
          <div className="form-group">
            <label className="form-label">Store Description</label>
            <textarea value={storeInfo.storeDesc} onChange={e => setStoreInfo(s => ({ ...s, storeDesc: e.target.value }))} placeholder="Tell buyers what you sell..." rows={3} style={{ resize: 'vertical' }} />
          </div>

          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1rem', marginTop: '1.2rem', fontSize: '0.95rem' }}>Social Links</div>
          <div className="form-group">
            <label className="form-label">Instagram</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '0.85rem' }}>instagram.com/</span>
              <input value={storeInfo.instagram} onChange={e => setStoreInfo(s => ({ ...s, instagram: e.target.value }))} placeholder="yourusername" style={{ paddingLeft: '7.5rem' }} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">WhatsApp Number</label>
            <input value={storeInfo.whatsapp} onChange={e => setStoreInfo(s => ({ ...s, whatsapp: e.target.value }))} placeholder="e.g. 08012345678" />
          </div>
          <div className="form-group">
            <label className="form-label">Twitter / X</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '0.85rem' }}>x.com/</span>
              <input value={storeInfo.twitter} onChange={e => setStoreInfo(s => ({ ...s, twitter: e.target.value }))} placeholder="yourusername" style={{ paddingLeft: '4.5rem' }} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Website (optional)</label>
            <input value={storeInfo.website} onChange={e => setStoreInfo(s => ({ ...s, website: e.target.value }))} placeholder="https://yourwebsite.com" />
          </div>

          <button onClick={saveStoreInfo} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }} disabled={saving}>
            {saving ? 'Saving...' : 'Save Store Info'}
          </button>
        </div>

        {/* Delivery Zones */}
        <div className="card" style={{ padding: '1.8rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.4rem' }}>Delivery Zones</div>
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '1.2rem' }}>Set your delivery locations and prices. Buyers will pick their location at checkout.</p>

          {deliveryZones.length > 0 && (
            <div style={{ marginBottom: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {deliveryZones.map((z, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{z.location}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--blue)', fontWeight: 700 }}>₦{z.price?.toLocaleString()}</div>
                  </div>
                  <button onClick={() => removeZone(i)} style={{ background: 'rgba(229,62,62,0.08)', border: '1px solid rgba(229,62,62,0.2)', color: 'var(--danger)', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px auto', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Location</label>
              <input value={newZone.location} onChange={e => setNewZone(z => ({ ...z, location: e.target.value }))} placeholder="e.g. Within Lagos" />
            </div>
            <div>
              <label className="form-label">Price (₦)</label>
              <input type="number" value={newZone.price} onChange={e => setNewZone(z => ({ ...z, price: e.target.value }))} placeholder="1500" />
            </div>
            <button onClick={addZone} className="btn-secondary" style={{ marginBottom: '0' }}>+ Add</button>
          </div>

          {deliveryZones.length === 0 && (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--muted)', fontSize: '0.85rem', background: 'var(--bg3)', borderRadius: '8px', marginBottom: '1rem' }}>
              No delivery zones yet. Add at least one above.
            </div>
          )}

          <button onClick={saveDeliveryZones} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={saving || deliveryZones.length === 0}>
            {saving ? 'Saving...' : 'Save Delivery Zones'}
          </button>
        </div>

      </div>
    </div>
  )
}
