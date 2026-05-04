const API = 'http://localhost:8000/api/v1';
const WS  = 'ws://localhost:8000/api/v1';

// ── Проверка на токен ─────────────────────────
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}

// ── Помощна функция — всички заявки с токен ───
function authFetch(url, options = {}) {
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
    });
}

// ── Изход ─────────────────────────────────────
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// ── Текущ потребител ───────────────────────────
let currentUser = null;

async function loadCurrentUser() {
    try {
        const res = await authFetch(`${API}/auth/me`);
        if (!res.ok) { logout(); return; }
        currentUser = await res.json();

        const el = document.getElementById('currentUsername');
        if (el) el.textContent = currentUser.username;
    } catch (err) {
        console.error('Грешка при зареждане на потребителя:', err);
    }
}

// ── Икони и цветове за каналите ───────────────
const CHANNEL_META = {
    'general':       { icon: '💬', color: '3d8bfd' },
    'random':        { icon: '🎲', color: '20c997' },
    'tech':          { icon: '⚙️', color: 'fd7e14' },
    'announcements': { icon: '📢', color: 'dc3545' },
    'design':        { icon: '🎨', color: '6f42c1' },
};

function getMeta(name) {
    return CHANNEL_META[name] || { icon: '💬', color: '6c757d' };
}

let currentId   = null;
let allChannels = [];

// ── WebSocket ─────────────────────────────────
let socket = null;

function connectWebSocket(channelId) {
    // затваряме старото свързване
    if (socket) socket.close();

    socket = new WebSocket(`${WS}/ws/${channelId}?token=${token}`);

    socket.onopen = () => {
        console.log(`WebSocket свързан към канал ${channelId}`);
    };

    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        appendMessage(msg);  // ново съобщение — добавяме в DOM
    };

    socket.onclose = () => {
        console.log('WebSocket затворен');
    };

    socket.onerror = (err) => {
        console.error('WebSocket грешка:', err);
    };
}

// ── Зареждане на канали от API ────────────────
async function loadChannels() {
    try {
        const res      = await authFetch(`${API}/channels`);
        const channels = await res.json();
        allChannels    = channels;
        renderChannels(channels);

        if (channels.length > 0) {
            switchChannel(channels[0].id);
        }
    } catch (err) {
        console.error('Грешка при зареждане на каналите:', err);
    }
}

// ── Зареждане на история на съобщения от API ──
async function loadMessages(channelId) {
    try {
        const res      = await authFetch(`${API}/channels/${channelId}/messages`);
        const messages = await res.json();
        renderMessages(messages);
    } catch (err) {
        console.error('Грешка при зареждане на съобщенията:', err);
    }
}

// ── Рендиране на списъка с канали ─────────────
function renderChannels(list) {
    const el = document.getElementById('channelsList');
    el.innerHTML = '';

    list.forEach(ch => {
        const meta = getMeta(ch.name);
        const a    = document.createElement('a');

        a.href      = '#';
        a.className = 'list-group-item list-group-item-action p-3 border-0 border-bottom' +
                      (ch.id === currentId ? ' active' : '');

        a.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="rounded-circle me-3 d-flex align-items-center justify-content-center"
                     style="width:40px;height:40px;background:#${meta.color}22;font-size:18px;flex-shrink:0;">
                    ${meta.icon}
                </div>
                <div class="w-100 overflow-hidden">
                    <div class="d-flex justify-content-between">
                        <h6 class="mb-0 text-truncate"># ${ch.name}</h6>
                    </div>
                </div>
            </div>`;

        a.onclick = (e) => { e.preventDefault(); switchChannel(ch.id); };
        el.appendChild(a);
    });
}

// ── Филтриране на канали ──────────────────────
function filterChannels(q) {
    const filtered = allChannels.filter(c =>
        c.name.toLowerCase().includes(q.toLowerCase())
    );
    renderChannels(filtered);
}

// ── Превключване на канал ─────────────────────
function switchChannel(id) {
    currentId = id;
    const ch  = allChannels.find(c => c.id === id);
    if (!ch) return;

    const meta = getMeta(ch.name);

    renderChannels(allChannels);

    document.getElementById('headerIcon').textContent = meta.icon;
    document.getElementById('headerName').textContent = '# ' + ch.name;

    // зареждаме историята и свързваме WebSocket
    loadMessages(id);
    connectWebSocket(id);
}

// ── Рендиране на всички съобщения (история) ───
function renderMessages(msgs) {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';
    msgs.forEach(m => appendMessage(m));
}

// ── Добавяне на едно съобщение в DOM ─────────
function appendMessage(m) {
    const container = document.getElementById('messagesContainer');
    const div       = document.createElement('div');
    const isMe      = currentUser && m.author.username === currentUser.username;

    div.className      = 'p-2 px-3 rounded-3 shadow-sm ' +
        (isMe ? 'bg-primary text-white align-self-end' : 'bg-light align-self-start');
    div.style.maxWidth = '75%';

    if (!isMe) {
        div.innerHTML = `
            <small class="fw-semibold d-block text-primary mb-1">${m.author.username}</small>
            ${m.content}
            <small class="d-block text-muted mt-1" style="font-size:0.7rem">
                ${new Date(m.sent_at).toLocaleTimeString('bg', { hour: '2-digit', minute: '2-digit' })}
            </small>`;
    } else {
        div.innerHTML = `
            ${m.content}
            <small class="d-block text-white-50 mt-1" style="font-size:0.7rem">
                ${new Date(m.sent_at).toLocaleTimeString('bg', { hour: '2-digit', minute: '2-digit' })}
            </small>`;
    }

    container.appendChild(div);

    const area = document.querySelector('.messages-area');
    area.scrollTop = area.scrollHeight;
}

// ── Изпращане чрез WebSocket ──────────────────
function sendMessage() {
    const input = document.getElementById('msgInput');
    const text  = input.value.trim();
    if (!text || !socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify({ content: text }));
    input.value = '';
}

// ── Изтриване на канал ────────────────────────
async function deleteChannel() {
    if (!currentId) return;

    const ch = allChannels.find(c => c.id === currentId);
    if (!confirm(`Изтриване на канал #${ch.name}?`)) return;

    try {
        const res = await authFetch(`${API}/channels/${currentId}`, {
            method: 'DELETE',
        });

        if (res.status === 204) {
            if (socket) socket.close();

            allChannels = allChannels.filter(c => c.id !== currentId);
            currentId   = null;

            document.getElementById('headerIcon').textContent = '';
            document.getElementById('headerName').textContent = '—';
            document.getElementById('messagesContainer').innerHTML = '';

            renderChannels(allChannels);
            if (allChannels.length > 0) {
                switchChannel(allChannels[0].id);
            }
        }
    } catch (err) {
        console.error('Грешка при изтриване:', err);
    }
}

// ── Създаване на канал ────────────────────────
async function createChannel() {
    const input   = document.getElementById('newChannelName');
    const errorEl = document.getElementById('channelError');
    const name    = input.value.trim().toLowerCase().replace(/\s+/g, '-');

    if (name.length < 2) {
        errorEl.textContent = 'Минимум 2 символа';
        return;
    }

    try {
        const res = await authFetch(`${API}/channels`, {
            method: 'POST',
            body: JSON.stringify({ name }),
        });

        if (res.status === 400) {
            const data = await res.json();
            errorEl.textContent = data.detail;
            return;
        }

        const channel = await res.json();

        bootstrap.Modal.getInstance(
            document.getElementById('createChannelModal')
        ).hide();

        input.value         = '';
        errorEl.textContent = '';

        allChannels.push(channel);
        renderChannels(allChannels);
        switchChannel(channel.id);

    } catch (err) {
        errorEl.textContent = 'Грешка при свързване със сървъра';
        console.error(err);
    }
}

async function searchMessages(q) {
    if (!currentId) return;

    // ако полето е празно — показваме всички съобщения
    if (!q.trim()) {
        loadMessages(currentId);
        return;
    }

    try {
        const res  = await authFetch(`${API}/channels/${currentId}/search?q=${encodeURIComponent(q)}`);
        const msgs = await res.json();

        const container = document.getElementById('messagesContainer');
        container.innerHTML = '';

        if (msgs.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted mt-4">
                    <i class="bi bi-search me-1"></i>
                    Няма резултати за "${q}"
                </div>`;
            return;
        }

        // показваме резултатите
        msgs.forEach(m => appendMessage(m, q));

    } catch (err) {
        console.error('Грешка при търсене:', err);
    }
}

function clearSearch() {
    const input = document.getElementById('messageSearch');
    if (input) input.value = '';
    if (currentId) loadMessages(currentId);
}

// ── Старт ─────────────────────────────────────
loadCurrentUser();
loadChannels();