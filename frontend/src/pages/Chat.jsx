import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ChannelList from '../components/ChannelList'
import MessageList from '../components/MessageList'
import MessageInput from '../components/MessageInput'
import CreateChannelModal from '../components/CreateChannelModal'

const CHANNEL_META = {
  general:       { icon: '💬', color: '3d8bfd' },
  random:        { icon: '🎲', color: '20c997' },
  tech:          { icon: '⚙️', color: 'fd7e14' },
  announcements: { icon: '📢', color: 'dc3545' },
  design:        { icon: '🎨', color: '6f42c1' },
}

function getMeta(name) {
  return CHANNEL_META[name] || { icon: '💬', color: '6c757d' }
}

function authFetch(url, options = {}) {
  const token = localStorage.getItem('token')
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  }).then(res => {
    if (res.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return res
  })
}

export default function Chat() {
  const [currentUser, setCurrentUser]   = useState(null)
  const [channels, setChannels]         = useState([])
  const [currentChannel, setCurrentChannel] = useState(null)
  const [messages, setMessages]         = useState([])
  const [search, setSearch]             = useState('')
  const [channelFilter, setChannelFilter] = useState('')
  const [showModal, setShowModal]       = useState(false)
  const socketRef = useRef(null)
  const navigate  = useNavigate()

  function logout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  useEffect(() => {
    authFetch('/api/v1/auth/me')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setCurrentUser)
      .catch(logout)

    authFetch('/api/v1/channels/')
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return
        setChannels(data)
        if (data.length > 0) switchChannel(data[0])
      })
      .catch(console.error)
  }, [])

  function switchChannel(channel) {
    setCurrentChannel(channel)
    setSearch('')
    setMessages([])

    authFetch(`/api/v1/channels/${channel.id}/messages`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setMessages(data) })
      .catch(console.error)

    if (socketRef.current) socketRef.current.close()

    const token = localStorage.getItem('token')
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${proto}//${location.host}/api/v1/ws/${channel.id}?token=${token}`)
    ws.onmessage = e => setMessages(prev => [...prev, JSON.parse(e.data)])
    socketRef.current = ws
  }

  async function createChannel(name) {
    const res = await authFetch('/api/v1/channels/', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Error creating channel')
    setChannels(prev => [...prev, data])
    setShowModal(false)
    switchChannel(data)
  }

  async function deleteChannel() {
    if (!currentChannel) return
    if (!confirm(`Delete channel #${currentChannel.name}?`)) return

    const res = await authFetch(`/api/v1/channels/${currentChannel.id}`, { method: 'DELETE' })

    if (res.status === 403) {
      alert('Only the channel creator can delete it')
      return
    }
    if (!res.ok && res.status !== 204) {
      alert('Error deleting channel')
      return
    }

    if (socketRef.current) socketRef.current.close()
    setChannels(prev => {
      const remaining = prev.filter(c => c.id !== currentChannel.id)
      setCurrentChannel(null)
      setMessages([])
      if (remaining.length > 0) switchChannel(remaining[0])
      return remaining
    })
  }

  async function deleteMessage(messageId) {
    if (!confirm('Delete message?')) return
    const res = await authFetch(
      `/api/v1/channels/${currentChannel.id}/messages/${messageId}`,
      { method: 'DELETE' }
    )
    if (res.status === 204) {
      setMessages(prev => prev.filter(m => m.id !== messageId))
    }
  }

  function sendMessage(text) {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return
    socketRef.current.send(JSON.stringify({ content: text }))
  }

  async function searchMessages(q) {
    if (!q.trim()) {
      authFetch(`/api/v1/channels/${currentChannel.id}/messages`)
        .then(r => r.json()).then(setMessages)
      return
    }
    const res = await authFetch(
      `/api/v1/channels/${currentChannel.id}/search?q=${encodeURIComponent(q)}`
    )
    setMessages(await res.json())
  }

  const meta = currentChannel ? getMeta(currentChannel.name) : null
  const filteredChannels = channels.filter(c =>
    c.name.toLowerCase().includes(channelFilter.toLowerCase())
  )

  return (
    <>
      <nav className="navbar navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold">
            <i className="bi bi-chat-dots-fill me-2"></i>InstantMessenger
          </span>
          <div className="d-flex align-items-center">
            <span className="text-white me-3">
              Logged in as: <strong>{currentUser?.username}</strong>
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={logout}>
              <i className="bi bi-box-arrow-right me-1"></i> Exit
            </button>
          </div>
        </div>
      </nav>

      <div style={{ height: 'calc(100vh - 56px)', display: 'flex', overflow: 'hidden' }}>
        <div style={{ width: 300, flexShrink: 0 }} className="border-end bg-white d-flex flex-column">
          <div className="p-3 bg-light border-bottom">
            <input
              className="form-control form-control-sm mb-2"
              placeholder="Search channels..."
              value={channelFilter}
              onChange={e => setChannelFilter(e.target.value)}
            />
            <button
              className="btn btn-primary btn-sm w-100"
              onClick={() => setShowModal(true)}
            >
              <i className="bi bi-plus-lg me-1"></i> New channel
            </button>
          </div>
          <ChannelList
            channels={filteredChannels}
            currentChannel={currentChannel}
            onSelect={switchChannel}
            getMeta={getMeta}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }} className="d-flex flex-column">
          <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <span className="fs-5 me-2">{meta?.icon}</span>
              <h6 className="mb-0">{currentChannel ? `# ${currentChannel.name}` : '—'}</h6>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="input-group input-group-sm" style={{ width: 220 }}>
                <input
                  className="form-control"
                  placeholder="Search in channel..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); searchMessages(e.target.value) }}
                />
                <button className="btn btn-outline-secondary" onClick={() => {
                  setSearch('')
                  if (currentChannel) {
                    authFetch(`/api/v1/channels/${currentChannel.id}/messages`)
                      .then(r => r.json()).then(setMessages)
                  }
                }}>
                  <i className="bi bi-x"></i>
                </button>
              </div>
              {currentChannel && (
                <button className="btn btn-link text-danger p-0" onClick={deleteChannel}>
                  <i className="bi bi-trash"></i>
                </button>
              )}
            </div>
          </div>

          <MessageList
            messages={messages}
            currentUser={currentUser}
            onDelete={deleteMessage}
            highlight={search}
          />

          <MessageInput onSend={sendMessage} disabled={!currentChannel} />
        </div>
      </div>

      <CreateChannelModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onCreate={createChannel}
      />
    </>
  )
}
