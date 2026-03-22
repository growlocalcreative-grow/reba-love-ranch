import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { Plus, Camera, X } from 'lucide-react'
import { listAll, createDoc, COL, Query, uploadImage, storage, BUCKET_ID } from '../lib/appwrite'

const ANIMALS = ['Luke', 'Snowy', 'Shadow', 'Shiloh', 'Dogs', 'Chickens', 'Cats', 'Property']

const NOTE_TYPES = {
  general:     { label: 'General',          icon: '📝', badge: 'badge-grey' },
  concern:     { label: 'Concern',          icon: '⚠️', badge: 'badge-red' },
  observation: { label: 'Observation',      icon: '👁️', badge: 'badge-blue' },
  question:    { label: 'Question',         icon: '❓', badge: 'badge-orange' },
  supply:      { label: 'Supply Location',  icon: '📦', badge: 'badge-green' },
}

const SEED_NOTES = [
  { $id: 'seed-1', author: 'Owner', created_at: '2025-08-01T00:00:00.000Z', note_type: 'supply', animal: 'Property', content: 'Mealworms and scratch for chickens are in the cabinet inside the coop. Fresh crumble bucket is also in there for refilling the gravity feeder.', photo_urls: [] },
  { $id: 'seed-2', author: 'Owner', created_at: '2025-08-01T00:00:00.000Z', note_type: 'supply', animal: 'Property', content: 'Dog Dentastix are in the cabinet above the dog food bin in the mudroom. Wet food cans are on the shelf below.', photo_urls: [] },
]

export default function Notes() {
  const [notes, setNotes] = useState(SEED_NOTES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ animal: '', note_type: 'observation', content: '', author: 'Sitter' })
  const [photoFiles, setPhotoFiles] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const fileRef = useRef()

  useEffect(() => { fetchNotes() }, [])

  async function fetchNotes() {
    setLoading(true)
    try {
      const docs = await listAll(COL.ranchNotes, [Query.orderDesc('$createdAt')])
      if (docs.length > 0) setNotes([...SEED_NOTES, ...docs])
    } catch (e) {
      console.error('Notes fetch failed, showing seed notes', e)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files)
    setPhotoFiles(prev => [...prev, ...files])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => setPhotoPreviews(p => [...p, ev.target.result])
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (i) => {
    setPhotoPreviews(p => p.filter((_, idx) => idx !== i))
    setPhotoFiles(p => p.filter((_, idx) => idx !== i))
  }

  async function save() {
    if (!form.content.trim()) return
    setSaving(true)

    let uploadedUrls = []
    if (photoFiles.length > 0) {
      setUploadingPhotos(true)
      try {
        uploadedUrls = await Promise.all(photoFiles.map(f => uploadImage(f)))
      } catch (e) {
        console.error('Photo upload failed', e)
        // fallback: use local previews so note still saves
        uploadedUrls = photoPreviews
      }
      setUploadingPhotos(false)
    }

    try {
      const data = {
        author: form.author || 'Sitter',
        note_type: form.note_type,
        animal: form.animal || '',
        content: form.content,
        photo_urls: uploadedUrls,
      }
      const doc = await createDoc(COL.ranchNotes, data)
      setNotes(prev => [doc, ...prev])
    } catch (e) {
      console.error(e)
      const fallback = { $id: Date.now().toString(), ...form, photo_urls: uploadedUrls, created_at: new Date().toISOString() }
      setNotes(prev => [fallback, ...prev])
    } finally {
      setSaving(false)
      setShowModal(false)
      setForm({ animal: '', note_type: 'observation', content: '', author: 'Sitter' })
      setPhotoFiles([])
      setPhotoPreviews([])
    }
  }

  return (
    <div>
      <div className="page-title">📝 Notes</div>
      <div className="page-subtitle">Owner notes, sitter observations &amp; supply locations</div>

      {loading && <div style={{ textAlign: 'center', padding: 20, color: 'var(--slate-grey)' }}>Loading notes...</div>}

      {notes.length === 0 && !loading && (
        <div className="empty-state"><div className="empty-icon">📝</div><p>No notes yet. Tap + to add your first note.</p></div>
      )}

      {notes.map(note => (
        <div key={note.$id} className="card" style={{ borderLeft: `4px solid ${note.note_type === 'concern' ? 'var(--danger)' : note.note_type === 'supply' ? 'var(--forest-green)' : 'var(--sky-blue)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13 }}>
                {NOTE_TYPES[note.note_type]?.icon} {note.animal || 'General'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--slate-grey)', marginTop: 2 }}>
                {note.author} · {format(new Date(note.created_at || note.$createdAt), 'MMM d, h:mm a')}
              </div>
            </div>
            <span className={`badge ${NOTE_TYPES[note.note_type]?.badge}`}>{NOTE_TYPES[note.note_type]?.label}</span>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6 }}>{note.content}</div>
          {note.photo_urls && note.photo_urls.length > 0 && (
            <div className="photo-grid" style={{ marginTop: 10 }}>
              {note.photo_urls.map((url, i) => (
                <img key={i} src={url} alt="" className="photo-thumb" />
              ))}
            </div>
          )}
        </div>
      ))}

      <button className="fab" onClick={() => setShowModal(true)}><Plus /></button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Add Note</div>

            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input className="form-input" type="text" placeholder="Sitter name..." value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Animal / Area</label>
              <select className="form-select" value={form.animal} onChange={e => setForm({ ...form, animal: e.target.value })}>
                <option value="">General</option>
                {ANIMALS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={form.note_type} onChange={e => setForm({ ...form, note_type: e.target.value })}>
                {Object.entries(NOTE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Note *</label>
              <textarea className="form-textarea" style={{ minHeight: 100 }} placeholder="Write your note here..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
            </div>

            {/* Photo upload */}
            <div className="form-group">
              <label className="form-label">Photos {uploadingPhotos && '(uploading...)'}</label>
              <div className="photo-grid">
                {photoPreviews.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} alt="" className="photo-thumb" />
                    <button onClick={() => removePhoto(i)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', padding: 0 }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <div className="photo-upload-btn" onClick={() => fileRef.current?.click()}>
                  <Camera size={20} />
                  <span>Add Photo</span>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple capture="environment" style={{ display: 'none' }} onChange={handlePhotos} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} disabled={saving || uploadingPhotos} onClick={save}>
                {saving ? 'Saving...' : uploadingPhotos ? 'Uploading photos...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
