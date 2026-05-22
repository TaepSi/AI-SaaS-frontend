const API_URL = "https://ai-saas-site.onrender.com";

// временное хранение регистрации
let pendingEmail = "";
let pendingPassword = "";

// utils
function isValidEmail(email) {
    return email.includes("@") && email.includes(".");
}

function showError(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function saveUser(userId, email) {
    localStorage.setItem("user_id", userId);
    localStorage.setItem("email", email);
}

// ================= LOGIN =================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        showError("loginError", "");

        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            return showError("loginError", data.error || "Ошибка входа");
        }

        saveUser(data.user_id, data.email);
        window.location.href = "chat.html";
    });
}

// ================= REGISTER =================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value.trim();
        const password2 = document.getElementById("registerPassword2").value.trim();

        showError("registerError", "");

        if (!email || !password || !password2) {
            return showError("registerError", "Заполни все поля");
        }

        if (!isValidEmail(email)) {
            return showError("registerError", "Неверный email");
        }

        if (password !== password2) {
            return showError("registerError", "Пароли не совпадают");
        }

        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            return showError("registerError", data.error || "Ошибка регистрации");
        }

        pendingEmail = email;
        pendingPassword = password;

        registerForm.style.display = "none";
        document.getElementById("verifyBlock").style.display = "block";
    });
}

// ================= VERIFY =================
const verifyForm = document.getElementById("verifyForm");

if (verifyForm) {
    verifyForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const code = document.getElementById("verifyCode").value.trim();

        showError("verifyError", "");

        const res = await fetch(`${API_URL}/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: pendingEmail,
                code
            })
        });

        const data = await res.json();

        if (!res.ok) {
            return showError("verifyError", data.error || "Ошибка кода");
        }

        // автоматический логин после verify
        const loginRes = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: pendingEmail,
                password: pendingPassword
            })
        });

        const loginData = await loginRes.json();

        if (!loginRes.ok) {
            return showError("verifyError", "Аккаунт создан, но вход не удался");
        }

        saveUser(loginData.user_id, loginData.email);
        window.location.href = "chat.html";
    });
}

// ================= RESEND =================
const resend = document.getElementById("resendCode");

if (resend) {
    resend.addEventListener("click", async (e) => {
        e.preventDefault();

        await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: pendingEmail,
                password: pendingPassword
            })
        });

        alert("Код отправлен повторно");
    });
}
