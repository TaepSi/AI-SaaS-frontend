document.addEventListener("DOMContentLoaded", () => {

console.log("SCRIPT START");

window.requireAuth = function () {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
        window.location.href = "index.html";
    }
}

const API_URL = "https://ai-saas-site.onrender.com";

// временное хранение регистрации
let pendingEmail = "";
let pendingPassword = "";

// ================= UTILS =================

function isValidEmail(email) {
    return email.includes("@") && email.includes(".");
}

function showError(id, text) {
    const el = document.getElementById(id);

    if (el) {
        el.textContent = text;
    }
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

        showError("loginError", "");

        if (!email || !password) {
            return showError("loginError", "Заполни все поля");
        }

        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
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

        if (password.length < 3) {
            return showError("registerError", "Пароль слишком короткий");
        }

        if (password !== password2) {
            return showError("registerError", "Пароли не совпадают");
        }

        console.log("REGISTER CLICKED");

        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await res.json();

        console.log(data);

        if (!res.ok) {
            return showError("registerError", data.error || "Ошибка регистрации");
        }

        console.log("REGISTER SUCCESS");

        pendingEmail = email;
        pendingPassword = password;

        registerForm.style.display = "none";

        const verifyBlock = document.getElementById("verifyBlock");

        if (verifyBlock) {
            verifyBlock.style.display = "block";
        }
    });
}

// ================= VERIFY =================

const verifyForm = document.getElementById("verifyForm");

if (verifyForm) {
    verifyForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const code = document.getElementById("verifyCode").value.trim();

        showError("verifyError", "");

        if (!code) {
            return showError("verifyError", "Введите код");
        }

        if (!pendingEmail) {
            return showError("verifyError", "Сначала зарегистрируйся");
        }

        const res = await fetch(`${API_URL}/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: pendingEmail,
                code
            })
        });

        const data = await res.json();

        if (!res.ok) {
            return showError("verifyError", data.error || "Неверный код");
        }

        // автоматический вход
        const loginRes = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: pendingEmail,
                password: pendingPassword
            })
        });

        const loginData = await loginRes.json();

        if (!loginRes.ok) {
            return showError("verifyError", "Ошибка входа");
        }

        saveUser(loginData.user_id, loginData.email);

        window.location.href = "chat.html";
    });
}

// ================= RESEND CODE =================

const resend = document.getElementById("resendCode");

if (resend) {
    resend.addEventListener("click", async (e) => {
        e.preventDefault();

        if (!pendingEmail) {
            return;
        }

        await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: pendingEmail,
                password: pendingPassword
            })
        });

        alert("Код отправлен повторно");
    });
}

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
        .then(r => r.json())
        .then(data => {

            if (data.error) {
                return;
            }

            document.getElementById("statSent").textContent = data.sent;
            document.getElementById("statReceived").textContent = data.received;
            document.getElementById("statDays").textContent = data.days;
            document.getElementById("statTokens").textContent = data.tokens;
        })
        .catch(err => {
            console.error(err);
        });
}

console.log("SCRIPT END");

});
