import { useState } from 'react'

export default function CreateChannelModal({ show, onClose, onCreate }) {
  const [name, setName]   = useState('')
  const [error, setError] = useState('')

  if (!show) return null

  async function handleCreate() {
    const clean = name.trim().toLowerCase().replace(/\s+/g, '-')
    if (clean.length < 3) { setError('Minimum 3 characters'); return }

    try {
      await onCreate(clean)
      setName('')
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">New channel</h5>
            <button className="btn-close" onClick={() => { onClose(); setName(''); setError('') }} />
          </div>
          <div className="modal-body">
            <input
              className="form-control"
              placeholder="channel-name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            {error && <div className="text-danger small mt-1">{error}</div>}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => { onClose(); setName(''); setError('') }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate}>Create</button>
          </div>
        </div>
      </div>
    </div>
  )
}
