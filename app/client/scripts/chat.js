const HOST = window.location.host;
const API = `http://${HOST}/api/v1`;
const WS = `ws://${HOST}/api/v1`;

// validation token
const token = localStorage.getItem("token");
if (!token) {
  window.location.replace("/login");
}

// help function for fetch with auth header
function authFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

function logout() {
  localStorage.removeItem("token");
  window.location.replace("/login");
}

let currentUser = null;

async function loadCurrentUser() {
  try {
    const res = await authFetch(`${API}/auth/me`);
    if (!res.ok) {
      logout();
      return;
    }
    currentUser = await res.json();

    const el = document.getElementById("currentUsername");
    if (el) el.textContent = currentUser.username;
  } catch (err) {
    console.error("Error when download user", err);
  }
}

// defaultProps for channel icons and colors
const CHANNEL_META = {
  general: { icon: "💬", color: "3d8bfd" },
  random: { icon: "🎲", color: "20c997" },
  tech: { icon: "⚙️", color: "fd7e14" },
  announcements: { icon: "📢", color: "dc3545" },
  design: { icon: "🎨", color: "6f42c1" },
};

function getMeta(name) {
  return CHANNEL_META[name] || { icon: "💬", color: "6c757d" };
}

let currentId = null;
let allChannels = [];

let socket = null;

function connectWebSocket(channelId) {
  // close previous socket
  if (socket) socket.close();

  socket = new WebSocket(`${WS}/ws/${channelId}?token=${token}`);

  socket.onopen = () => {
    console.log(`WebSocket connect to channel ${channelId}`);
  };

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    appendMessage(msg); // add message in DOM
  };

  socket.onclose = () => {
    console.log("WebSocket close");
  };

  socket.onerror = (err) => {
    console.error("WebSocket error:", err);
  };
}

// load channels from API
async function loadChannels() {
  try {
    const res = await authFetch(`${API}/channels`);
    const channels = await res.json();
    allChannels = channels;
    renderChannels(channels);

    if (channels.length > 0) {
      switchChannel(channels[0].id);
    }
  } catch (err) {
    console.error("Error loading channels:", err);
  }
}

// load msg from API
async function loadMessages(channelId) {
  try {
    const res = await authFetch(`${API}/channels/${channelId}/messages`);
    const messages = await res.json();
    renderMessages(messages);
  } catch (err) {
    console.error("Error loading messages:", err);
  }
}

function renderChannels(list) {
  const el = document.getElementById("channelsList");
  el.innerHTML = "";

  list.forEach((ch) => {
    const meta = getMeta(ch.name);
    const a = document.createElement("a");

    a.href = "#";
    a.className =
      "list-group-item list-group-item-action p-3 border-0 border-bottom" +
      (ch.id === currentId ? " active" : "");

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

    a.onclick = (e) => {
      e.preventDefault();
      switchChannel(ch.id);
    };
    el.appendChild(a);
  });
}

function filterChannels(q) {
  const filtered = allChannels.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase()),
  );
  renderChannels(filtered);
}

function switchChannel(id) {
  currentId = id;
  const ch = allChannels.find((c) => c.id === id);
  if (!ch) return;

  const meta = getMeta(ch.name);

  renderChannels(allChannels);

  document.getElementById("headerIcon").textContent = meta.icon;
  document.getElementById("headerName").textContent = "# " + ch.name;

  // load history and connect WebSocket
  loadMessages(id);
  connectWebSocket(id);
}

// render all msg
function renderMessages(msgs) {
  const container = document.getElementById("messagesContainer");
  container.innerHTML = "";
  msgs.forEach((m) => appendMessage(m));
}

function appendMessage(m, highlight = "") {
  const container = document.getElementById("messagesContainer");
  const div = document.createElement("div");
  const isMe = currentUser && m.author.username === currentUser.username;

  div.className =
    "p-2 px-3 rounded-3 shadow-sm position-relative msg-bubble " +
    (isMe
      ? "bg-primary text-white align-self-end"
      : "bg-light align-self-start");
  div.style.maxWidth = "75%";

  let content = m.content;
  if (highlight) {
    const re = new RegExp(
      `(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    content = content.replace(re, "<mark>$1</mark>");
  }

  // delete btn only for your msg
  const deleteBtn = isMe
    ? `
        <button class="btn btn-sm delete-msg-btn"
                onclick="deleteMessage(${m.id})"
                title="Delete">
            <i class="bi bi-trash" style="font-size:0.7rem"></i>
        </button>`
    : "";

  if (!isMe) {
    div.innerHTML = `
            <small class="fw-semibold d-block text-primary mb-1">${m.author.username}</small>
            ${content}
            <small class="d-block text-muted mt-1" style="font-size:0.7rem">
                ${new Date(m.sent_at).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}
            </small>`;
  } else {
    div.innerHTML = `
            ${deleteBtn}
            ${content}
            <small class="d-block text-white-50 mt-1" style="font-size:0.7rem">
                ${new Date(m.sent_at).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}
            </small>`;
  }

  div.dataset.messageId = m.id;

  container.appendChild(div);
  const area = document.querySelector(".messages-area");
  area.scrollTop = area.scrollHeight;
}

async function deleteMessage(messageId) {
  if (!confirm("Delete message?")) return;

  try {
    const res = await authFetch(
      `${API}/channels/${currentId}/messages/${messageId}`,
      { method: "DELETE" },
    );

    if (res.status === 204) {
      // remove msg from DOM
      const el = document.querySelector(`[data-message-id="${messageId}"]`);
      if (el) el.remove();
    }
  } catch (err) {
    console.error("Error deleting message:", err);
  }
}

// send with WebSocket
function sendMessage() {
  const input = document.getElementById("msgInput");
  const text = input.value.trim();
  if (!text || !socket || socket.readyState !== WebSocket.OPEN) return;

  socket.send(JSON.stringify({ content: text }));
  input.value = "";
}

async function deleteChannel() {
  if (!currentId) return;

  const ch = allChannels.find((c) => c.id === currentId);
  if (!confirm(`Delete channel #${ch.name}?`)) return;

  try {
    const res = await authFetch(`${API}/channels/${currentId}`, {
      method: "DELETE",
    });

    console.log("delete status:", res.status);

    if (res.status === 403) {
      alert("Only the channel creator can delete it");
      return;
    }

    if (res.status === 204) {
      if (socket) socket.close();

      allChannels = allChannels.filter((c) => c.id !== currentId);
      currentId = null;

      document.getElementById("headerIcon").textContent = "";
      document.getElementById("headerName").textContent = "—";
      document.getElementById("messagesContainer").innerHTML = "";

      renderChannels(allChannels);
      if (allChannels.length > 0) {
        switchChannel(allChannels[0].id);
      }
    }
  } catch (err) {
    console.error("Deletion error:", err);
  }
}

async function createChannel() {
  const input = document.getElementById("newChannelName");
  const errorEl = document.getElementById("channelError");
  const name = input.value.trim().toLowerCase().replace(/\s+/g, "-");

  if (name.length < 2) {
    errorEl.textContent = "Minimum 2 symbols";
    return;
  }

  try {
    const res = await authFetch(`${API}/channels`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });

    if (res.status === 400) {
      const data = await res.json();
      errorEl.textContent = data.detail;
      return;
    }

    const channel = await res.json();

    bootstrap.Modal.getInstance(
      document.getElementById("createChannelModal"),
    ).hide();

    input.value = "";
    errorEl.textContent = "";

    allChannels.push(channel);
    renderChannels(allChannels);
    switchChannel(channel.id);
  } catch (err) {
    errorEl.textContent = "Error connecting to the server";
    console.error(err);
  }
}

async function searchMessages(q) {
  if (!currentId) return;

  // if search is empty, show all msg
  if (!q.trim()) {
    loadMessages(currentId);
    return;
  }

  try {
    const res = await authFetch(
      `${API}/channels/${currentId}/search?q=${encodeURIComponent(q)}`,
    );
    const msgs = await res.json();

    const container = document.getElementById("messagesContainer");
    container.innerHTML = "";

    if (msgs.length === 0) {
      container.innerHTML = `
                <div class="text-center text-muted mt-4">
                    <i class="bi bi-search me-1"></i>
                    No results for "${q}"
                </div>`;
      return;
    }

    // show all msg which find
    msgs.forEach((m) => appendMessage(m, q));
  } catch (err) {
    console.error("Search error:", err);
  }
}

function clearSearch() {
  const input = document.getElementById("messageSearch");
  if (input) input.value = "";
  if (currentId) loadMessages(currentId);
}

loadCurrentUser();
loadChannels();
