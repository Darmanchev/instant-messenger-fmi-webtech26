// ── Данни за каналите с примерни съобщения ──
const CHANNELS = [
    {
        id: 1,
        name: 'general',
        icon: '💬',
        color: '3d8bfd',
        messages: [
            { from: 'Alice',  me: false, text: 'Здравейте на всички! Добре дошли в #general 👋' },
            { from: 'Bob',    me: false, text: 'Благодаря! Радвам се, че съм тук.' },
            { from: 'You',    me: true,  text: 'Здравейте! С какво се занимавате?' },
            { from: 'Alice',  me: false, text: 'Правим месинджър за университета 😄' },
        ]
    },
    {
        id: 2,
        name: 'random',
        icon: '🎲',
        color: '20c997',
        messages: [
            { from: 'Dave',   me: false, text: 'Видяхте ли новия мем за JavaScript? 😂' },
            { from: 'Eve',    me: false, text: 'Хаха, да! Много точно.' },
            { from: 'You',    me: true,  text: 'Пратете линка!' },
            { from: 'Dave',   me: false, text: 'Момент, търся...' },
        ]
    },
    {
        id: 3,
        name: 'tech',
        icon: '⚙️',
        color: 'fd7e14',
        messages: [
            { from: 'Grace',  me: false, text: 'FastAPI е по-добър от Flask за нови проекти.' },
            { from: 'Hank',   me: false, text: 'Съгласен. Async е важно.' },
            { from: 'You',    me: true,  text: 'И автодокументацията чрез Swagger 🔥' },
            { from: 'Grace',  me: false, text: 'Точно! Плюс Pydantic валидация.' },
        ]
    },
    {
        id: 4,
        name: 'announcements',
        icon: '📢',
        color: 'dc3545',
        messages: [
            { from: 'Admin',  me: false, text: '🎉 BestMessenger v1.0 е пуснат!' },
            { from: 'Admin',  me: false, text: 'Нови функции: канали, търсене, WebSocket.' },
            { from: 'Alice',  me: false, text: 'Страхотна работа, екип! 🚀' },
            { from: 'You',    me: true,  text: 'Новият UI изглежда страхотно!' },
        ]
    },
    {
        id: 5,
        name: 'design',
        icon: '🎨',
        color: '6f42c1',
        messages: [
            { from: 'Jane',   me: false, text: 'Макетите за тъмната тема са готови 🌙' },
            { from: 'You',    me: true,  text: 'Отлично! Харесва ми цветовата палитра.' },
            { from: 'Jane',   me: false, text: 'Благодаря! Тъмносиньо + индиго акцент.' },
            { from: 'Kate',   me: false, text: 'Може ли да видим светлата версия?' },
        ]
    },
];

let currentId = null;

// ── Рендиране на списъка с канали ──
function renderChannels(list) {
    const el = document.getElementById('channelsList');
    el.innerHTML = '';
    list.forEach(ch => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'list-group-item list-group-item-action p-3 border-0 border-bottom' +
                      (ch.id === currentId ? ' active' : '');
        a.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="rounded-circle me-3 d-flex align-items-center justify-content-center"
                     style="width:40px;height:40px;background:#${ch.color}22;font-size:18px;flex-shrink:0;">
                    ${ch.icon}
                </div>
                <div class="w-100 overflow-hidden">
                    <div class="d-flex justify-content-between">
                        <h6 class="mb-0 text-truncate"># ${ch.name}</h6>
                        <small class="${ch.id === currentId ? 'text-white-50' : 'text-muted'}">${ch.messages.length} съобщ.</small>
                    </div>
                    <small class="${ch.id === currentId ? 'text-white-50' : 'text-muted'} text-truncate d-block">
                        ${ch.messages.at(-1).text}
                    </small>
                </div>
            </div>`;
        a.onclick = (e) => { e.preventDefault(); switchChannel(ch.id); };
        el.appendChild(a);
    });
}

// ── Филтриране на канали по търсене ──
function filterChannels(q) {
    const filtered = CHANNELS.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));
    renderChannels(filtered);
}

// ── Превключване на канал ──
function switchChannel(id) {
    currentId = id;
    const ch = CHANNELS.find(c => c.id === id);
    if (!ch) return;

    renderChannels(CHANNELS);

    document.getElementById('headerIcon').textContent = ch.icon;
    document.getElementById('headerName').textContent = '# ' + ch.name;

    renderMessages(ch.messages);
}

// ── Рендиране на съобщения ──
function renderMessages(msgs) {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';
    msgs.forEach(m => {
        const div = document.createElement('div');
        div.className = 'p-2 px-3 rounded-3 shadow-sm ' +
            (m.me ? 'bg-primary text-white align-self-end' : 'bg-light align-self-start');
        div.style.maxWidth = '75%';
        if (!m.me) {
            div.innerHTML = `<small class="fw-semibold d-block text-primary mb-1">${m.from}</small>${m.text}`;
        } else {
            div.textContent = m.text;
        }
        container.appendChild(div);
    });
    const area = document.querySelector('.messages-area');
    area.scrollTop = area.scrollHeight;
}

// ── Изпращане на ново съобщение ──
function sendMessage() {
    const input = document.getElementById('msgInput');
    const text = input.value.trim();
    if (!text || !currentId) return;

    const ch = CHANNELS.find(c => c.id === currentId);
    ch.messages.push({ from: 'You', me: true, text });
    input.value = '';

    renderMessages(ch.messages);
    renderChannels(CHANNELS);
}

// ── Зареждане на първия канал при стартиране ──
switchChannel(1);