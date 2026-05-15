export default function ChannelList({ channels, currentChannel, onSelect, getMeta }) {
  return (
    <div className="overflow-auto flex-grow-1 p-2 d-flex flex-column gap-1">
      {channels.map(ch => {
        const meta   = getMeta(ch.name)
        const active = currentChannel?.id === ch.id
        return (
          <a
            key={ch.id}
            href="#"
            className="text-decoration-none"
            onClick={e => { e.preventDefault(); onSelect(ch) }}
          >
            <div
              className="d-flex align-items-center p-2 rounded-3"
              style={{
                background: active ? '#0d6efd' : 'transparent',
                color: active ? '#fff' : 'inherit',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f0f0f0' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <div
                className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                style={{ width: 36, height: 36, background: `#${meta.color}22`, fontSize: 16, flexShrink: 0 }}
              >
                {meta.icon}
              </div>
              <h6 className="mb-0 text-truncate"># {ch.name}</h6>
            </div>
          </a>
        )
      })}
    </div>
  )
}
