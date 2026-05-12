const HOST = window.location.host;
const API  = `http://${HOST}/api/v1`;

// if already log in go to chat
if (localStorage.getItem('token')) {
    window.location.replace('/chat');
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');
    const submitBtn = document.getElementById('submitBtn');

    // deactivate btn while searching
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Loading...';
    errorMsg.classList.add('d-none');

    try {
        const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            errorMsg.textContent = data.detail || 'Login error';
            errorMsg.classList.remove('d-none');
            return;
        }

        // save token
        localStorage.setItem('token', data.access_token);

        // go to our chat page
        window.location.replace('/chat');

    } catch (err) {
        errorMsg.textContent = 'Error connecting to the server';
        errorMsg.classList.remove('d-none');
    } finally {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Log in';
    }
});