const API = 'http://localhost:8000/api/v1';

// Ако вече е влязъл — веднага към чата
if (localStorage.getItem('token')) {
    window.location.href = 'chat.html';
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');
    const submitBtn = document.getElementById('submitBtn');

    // Блокираме бутона докато тече заявката
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Зареждане...';
    errorMsg.classList.add('d-none');

    try {
        const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            // Показваме грешката от сървъра
            errorMsg.textContent = data.detail || 'Грешка при вход';
            errorMsg.classList.remove('d-none');
            return;
        }

        // Запазваме токена
        localStorage.setItem('token', data.access_token);

        // Преминаваме към чата
        window.location.href = 'chat.html';

    } catch (err) {
        errorMsg.textContent = 'Грешка при свързване със сървъра';
        errorMsg.classList.remove('d-none');
    } finally {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Влез';
    }
});