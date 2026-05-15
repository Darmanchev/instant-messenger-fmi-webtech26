import { useState } from 'react'

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState('')

  function handleSend() {
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  return (
    <div className="p-3 border-top bg-light">
      <div className="d-flex align-items-center gap-2">
        <input
          className="form-control border-0 bg-white"
          placeholder="Write a message..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          disabled={disabled}
        />
        <button className="btn btn-primary px-4 flex-shrink-0" onClick={handleSend} disabled={disabled}>
          <i className="bi bi-send-fill"></i>
        </button>
      </div>
    </div>
  )
}
