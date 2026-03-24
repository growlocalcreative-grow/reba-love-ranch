import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { RANCH_CONFIG } from '../data/ranch.config'
import { Eye, EyeOff, AlertTriangle, Info } from 'lucide-react'

export default function LoginScreen() {
  const { login, signup } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  // Detect if the email being typed matches the owner email
  const isOwnerEmail = form.email.toLowerCase() === RANCH_CONFIG.ownerEmail?.toLowerCase()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        if (!form.name.trim()) { setError('Please enter your name.'); setLoading(false); return }
        await signup(form.email, form.password, form.name)
      }
    } catch (err) {
      console.error(err)
      if (err.code === 401 || err.code === 400) {
        setError('Incorrect email or password. Please try again.')
      } else if (err.code === 409) {
        setError('An account with this email already exists. Try signing in instead.')
      } else if (err.code === 429) {
        setError('Too many attempts. Please wait a moment and try again.')
      } else {
        setError(err.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--warm-beige)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      maxWidth: 480,
      margin: '0 auto',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          width: 80, height: 80,
          background: 'linear-gradient(135deg, var(--sky-blue), var(--sky-blue-dark))',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 6px 24px rgba(74,144,226,0.4)',
        }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'white' }}>
            {RANCH_CONFIG.shortName}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 26, color: 'var(--charcoal)', marginBottom: 4 }}>
          {RANCH_CONFIG.name}
        </div>
        <div style={{ fontSize: 13, color: 'var(--slate-grey)', fontWeight: 600 }}>
          {RANCH_CONFIG.tagline} · {RANCH_CONFIG.location}
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: 'white', borderRadius: 20, padding: '28px 24px',
        width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        border: '1px solid var(--warm-beige-dark)',
      }}>
        {/* Mode tabs */}
        <div style={{ display: 'flex', background: 'var(--warm-beige)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(null) }} style={{
              flex: 1, padding: '9px 0', border: 'none', borderRadius: 8,
              background: mode === m ? 'white' : 'transparent',
              fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13,
              textTransform: 'uppercase', letterSpacing: '0.04em',
              color: mode === m ? 'var(--sky-blue)' : 'var(--slate-grey)',
              cursor: 'pointer',
              boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}>
              {m === 'login' ? '🔐 Sign In' : '✨ Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name — signup only */}
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input className="form-input" type="text" placeholder="e.g. Karen, Ranch Sitter..." value={form.name} onChange={e => update('name', e.target.value)} required autoComplete="name" />
            </div>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} required autoComplete="email" />
            {/* Live role preview as they type */}
            {mode === 'signup' && form.email.length > 4 && (
              <div style={{
                marginTop: 6, padding: '6px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                background: isOwnerEmail ? 'rgba(46,125,50,0.1)' : 'rgba(74,144,226,0.1)',
                color: isOwnerEmail ? 'var(--forest-green)' : 'var(--sky-blue)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {isOwnerEmail ? '🤠 Owner account — full Admin access' : '🐴 Ranch Sitter account'}
              </div>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder={mode === 'signup' ? 'Min. 8 characters' : 'Your password'} value={form.password} onChange={e => update('password', e.target.value)} required minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-grey)', display: 'flex', alignItems: 'center' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Role explanation on signup */}
          {mode === 'signup' && (
            <div className="alert alert-info" style={{ marginBottom: 16 }}>
              <Info size={16} color="var(--sky-blue)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div className="alert-content">
                <div className="alert-body" style={{ fontSize: 12 }}>
                  Your role is set automatically by your email address.
                  <br />🤠 <strong>Owner</strong> — uses {RANCH_CONFIG.ownerEmail}
                  <br />🐴 <strong>Ranch Sitter</strong> — any other email
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 16 }}>
              <AlertTriangle size={16} color="var(--danger)" />
              <div className="alert-content">
                <div className="alert-body" style={{ color: 'var(--danger)' }}>{error}</div>
              </div>
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 4, padding: '14px 0', fontSize: 14 }}>
            {loading
              ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
              : (mode === 'login' ? '🐴 Sign In to Ranch' : '✨ Create My Account')
            }
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--slate-grey)', lineHeight: 1.6 }}>
          {mode === 'login'
            ? "Don't have an account? Tap Create Account above. Sitters — ask the ranch owner for your login details."
            : 'Your role is determined by your email address automatically.'}
        </div>
      </div>

      <div style={{ marginTop: 24, fontSize: 11, color: 'var(--slate-grey)', opacity: 0.6, textAlign: 'center' }}>
        🐴🐔🐕🌾 · {RANCH_CONFIG.name} · Private Access Only
      </div>
    </div>
  )
}
