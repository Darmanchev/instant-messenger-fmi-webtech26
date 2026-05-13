import { useEffect, useRef } from 'react'

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function highlight(text, query) {
  const safe = escapeHtml(text)
  if (!query) return safe
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return safe.replace(re, '<mark>$1</mark>')
}

export default function MessageList({ messages = [], currentUser, onDelete, highlight: query }) {
  const safeMessages = Array.isArray(messages) ? messages : []
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-grow-1 p-4 overflow-auto">
      <div className="d-flex flex-column gap-3">
        {safeMessages.map(m => {
          const isMe = currentUser && m.author.username === currentUser.username
          const time = new Date(m.sent_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })

          return (
            <div
              key={m.id}
              className={`p-2 px-3 rounded-3 shadow-sm position-relative ${isMe ? 'bg-primary text-white align-self-end' : 'bg-light align-self-start'}`}
              style={{ maxWidth: '75%' }}
            >
              {!isMe && (
                <small className="fw-semibold d-block text-primary mb-1">{m.author.username}</small>
              )}
              {isMe && (
                <button
                  className="btn btn-sm position-absolute top-0 end-0 p-1 text-white-50"
                  onClick={() => onDelete(m.id)}
                  title="Delete"
                >
                  <i className="bi bi-trash" style={{ fontSize: '0.7rem' }}></i>
                </button>
              )}
              <span dangerouslySetInnerHTML={{ __html: highlight(m.content, query) }} />
              <small className={`d-block mt-1 ${isMe ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.7rem' }}>
                {time}
              </small>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
