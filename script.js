console.log("SCRIPT START");

const API_URL = "https://ai-saas-backend-production-5083.up.railway.app";

// ================= AUTH CHECK =================

function requireAuth() {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
        window.location.href = "index.html";
    }
}

window.requireAuth = requireAuth;

// ================= HELPERS =================

function showError(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function saveUser(userId, email) {
    localStorage.setItem("user_id", userId);
    localStorage.setItem("email", email);
}

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

// ================= LOGIN =================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

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

let pendingEmail = "";
let pendingPassword = "";

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value.trim();
        const password2 = document.getElementById("registerPassword2").value.trim();

        if (!email || !password || !password2) {
            return showError("registerError", "Заполни все поля");
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
            return showError("verifyError", data.error || "Неверный код");
        }

        saveUser(data.user_id, data.email);

        window.location.href = "chat.html";
    });
}

// ================= RESEND =================

const resend = document.getElementById("resendCode");

if (resend) {
    resend.addEventListener("click", async (e) => {
        e.preventDefault();

        if (!pendingEmail) return;

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

// ================= CHAT =================

document.addEventListener("DOMContentLoaded", () => {

    const input = document.getElementById("messageInput");
    const button = document.getElementById("sendBtn");
    const messages = document.getElementById("messages");

    if (!input || !button || !messages) return;

    const userId = localStorage.getItem("user_id");

    if (!userId) {
        window.location.href = "index.html";
        return;
    }

    function addMessage(text, type) {
        const div = document.createElement("div");
        div.className = `message ${type}`;
        div.textContent = text;

        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    // ================= LOAD HISTORY =================
    async function loadHistory() {
        try {
            const res = await fetch(`${API_URL}/history?user_id=${userId}`);
            const data = await res.json();

            data.forEach(msg => {
                addMessage(msg.content, msg.role === "user" ? "user" : "ai");
            });

            messages.scrollTop = messages.scrollHeight;

        } catch (err) {
            console.error("history error:", err);
        }
    }

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, "user");
        input.value = "";

        try {
            const res = await fetch(`${API_URL}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: userId,
                    message: text
                })
            });

            const data = await res.json();

            if (!res.ok) {
                addMessage(data.error || "Ошибка сервера", "ai");
                return;
            }

            addMessage(data.reply, "ai");

        } catch (err) {
            console.error(err);
            addMessage("Сервер недоступен", "ai");
        }
    }

    button.addEventListener("click", sendMessage);

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    // 🚀 ВАЖНО: загрузка истории при входе
    loadHistory();
});

// ================= DASHBOARD =================

if (window.location.pathname.includes("dashboard.html")) {

    requireAuth();

    const email = localStorage.getItem("email");
    const userId = localStorage.getItem("user_id");

    const welcomeText = document.getElementById("welcomeText");

    if (welcomeText) {
        welcomeText.textContent = `Добро пожаловать, ${email}!`;
    }

    fetch(`${API_URL}/stats?user_id=${userId}`)
        .then(res => res.json())
        .then(data => {

            if (data.error) return;

            document.getElementById("statSent").textContent = data.sent;
            document.getElementById("statReceived").textContent = data.received;
            document.getElementById("statDays").textContent = data.days;
            document.getElementById("statTokens").textContent = data.tokens;

        })
        .catch(err => {
            console.error("stats error:", err);
        });
}

console.log("SCRIPT END");
