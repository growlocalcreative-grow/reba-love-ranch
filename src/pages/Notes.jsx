import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { Plus, Camera, X, Trash2 } from 'lucide-react'
import { RANCH_CONFIG, ANIMAL_NAMES } from '../data/ranch.config'
import { listAll, createDoc, COL, Query, uploadImage, databases, DB_ID } from '../lib/appwrite'
import { useAuth } from '../context/AuthContext'

const NOTE_TYPES = {
  general:     { label: 'General',         icon: '📝', badge: 'badge-grey' },
  concern:     { label: 'Concern',         icon: '⚠️', badge: 'badge-red' },
  observation: { label: 'Observation',     icon: '👁️', badge: 'badge-blue' },
  question:    { label: 'Question',        icon: '❓', badge: 'badge-orange' },
  supply:      { label: 'Supply Location', icon: '📦', badge: 'badge-green' },
}

export default function Notes() {
  const { user } = useAuth()
  const { ownerNotes } = RANCH_CONFIG

  const SEED_NOTES = ownerNotes.map((n, i) => ({
    $id: `seed-${i}`, author: 'Owner',
    created_at: new Date('2025-08-01').toISOString(),
    ...n, photo_urls: [], _isSeed: true,
  }))

  const [notes, setNotes] = useState(SEED_NOTES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [form, setForm] = useState({ animal: '', note_type: 'observation', content: '', author: user?.name || 'Sitter' })
  const [photoFiles, setPhotoFiles] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const fileRef = useRef()

  useEffect(() => { fetchNotes() }, [])

  async function fetchNotes() {
    setLoading(true)
    try {
      const docs = await listAll(COL.ranchNotes, [Query.orderDesc('$createdAt')])
      // Always merge seed notes + Appwrite notes (even if Appwrite returns 0)
      const appwriteNotes = docs.map(doc => ({
        ...doc,
        // Normalize date field — Appwrite uses $createdAt
        created_at: doc.created_at || doc.$createdAt,
      }))
      setNotes([...SEED_NOTES, ...appwriteNotes])
    } catch (e) {
      console.error('Notes fetch failed', e)
      // Keep showing seed notes if Appwrite fails
      setNotes(SEED_NOTES)
    } finally { setLoading(false) }
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
      try { uploadedUrls = await Promise.all(photoFiles.map(f => uploadImage(f))) }
      catch { uploadedUrls = photoPreviews }
      setUploadingPhotos(false)
    }
    try {
      const data = {
        author: user?.name || form.author || 'Sitter',
        note_type: form.note_type,
        animal: form.animal || '',
        content: form.content,
        photo_urls: uploadedUrls,
        created_at: new Date().toISOString(),
      }
      await createDoc(COL.ranchNotes, data)
      // Refetch all notes from Appwrite so every device stays in sync
      await fetchNotes()
    } catch {
      // Offline fallback — add locally only
      setNotes(prev => [{ $id: Date.now().toString(), ...form, photo_urls: uploadedUrls, created_at: new Date().toISOString() }, ...prev])
    } finally {
      setSaving(false)
      setShowModal(false)
      setForm({ animal: '', note_type: 'observation', content: '', author: user?.name || 'Sitter' })
      setPhotoFiles([])
      setPhotoPreviews([])
    }
  }

  async function deleteNote(note) {
    if (note._isSeed) {
      // Seed notes just remove from local state
      setNotes(prev => prev.filter(n => n.$id !== note.$id))
      setConfirmDelete(null)
      return
    }
    try {
      await databases.deleteDocument(DB_ID, COL.ranchNotes, note.$id)
      setNotes(prev => prev.filter(n => n.$id !== note.$id))
    } catch (e) {
      console.error('Delete failed', e)
      // Remove from UI anyway for UX
      setNotes(prev => prev.filter(n => n.$id !== note.$id))
    }
    setConfirmDelete(null)
  }

  const isOwner = user?.email?.toLowerCase() === RANCH_CONFIG.ownerEmail?.toLowerCase()

  return (
    <div>
      <div className="page-title">📝 Notes</div>
      <div className="page-subtitle">Owner notes, sitter observations &amp; supply locations</div>

      {loading && <div style={{ textAlign: 'center', padding: 20, color: 'var(--slate-grey)' }}>Loading notes...</div>}

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`badge ${NOTE_TYPES[note.note_type]?.badge}`}>{NOTE_TYPES[note.note_type]?.label}</span>
              {/* Delete button — owner can delete any note, sitter can delete their own */}
              {(isOwner || note.author === (user?.name || user?.email?.split('@')[0])) && (
                <button
                  onClick={() => setConfirmDelete(note)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-grey)', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' }}
                  title="Delete note"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6 }}>{note.content}</div>
          {note.photo_urls?.length > 0 && (
            <div className="photo-grid" style={{ marginTop: 10 }}>
              {note.photo_urls.map((url, i) => <img key={i} src={url} alt="" className="photo-thumb" />)}
            </div>
          )}
        </div>
      ))}

      {notes.length === 0 && !loading && (
        <div className="empty-state"><div className="empty-icon">📝</div><p>No notes yet. Tap + to add your first note.</p></div>
      )}

      <button className="fab" onClick={() => setShowModal(true)}><Plus /></button>

      {/* Add Note Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Add Note</div>
            <div className="form-group">
              <label className="form-label">Animal / Area</label>
              <select className="form-select" value={form.animal} onChange={e => setForm({ ...form, animal: e.target.value })}>
                <option value="">General</option>
                {[...ANIMAL_NAMES, 'Property'].map(a => <option key={a} value={a}>{a}</option>)}
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
            <div className="form-group">
              <label className="form-label">Photos {uploadingPhotos && '(uploading...)'}</label>
              <div className="photo-grid">
                {photoPreviews.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} alt="" className="photo-thumb" />
                    <button onClick={() => removePhoto(i)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', padding: 0 }}><X size={12} /></button>
                  </div>
                ))}
                <div className="photo-upload-btn" onClick={() => fileRef.current?.click()}><Camera size={20} /><span>Add Photo</span></div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple capture="environment" style={{ display: 'none' }} onChange={handlePhotos} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} disabled={saving || uploadingPhotos} onClick={save}>
                {saving ? 'Saving...' : uploadingPhotos ? 'Uploading...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Delete Note?</div>
            <div style={{ fontSize: 14, color: 'var(--slate-grey)', lineHeight: 1.6, marginBottom: 20 }}>
              Are you sure you want to delete this note? This cannot be undone.
              <div style={{ marginTop: 10, background: 'var(--warm-beige)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--charcoal)', fontStyle: 'italic' }}>
                "{confirmDelete.content?.slice(0, 80)}{confirmDelete.content?.length > 80 ? '...' : ''}"
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => deleteNote(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
