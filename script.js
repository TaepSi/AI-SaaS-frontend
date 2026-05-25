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

    function addMessage(text, type) {
        const div = document.createElement("div");
        div.className = `message ${type}`;
        div.textContent = text;

        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
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
                    user_id: localStorage.getItem("user_id"),
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

});

console.log("SCRIPT END");
