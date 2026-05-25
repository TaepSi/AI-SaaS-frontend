console.log("CHAT JS LOADED");

const API_URL = "https://ai-saas-backend-production-5083.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
    console.log("CHAT READY");

    const input = document.getElementById("messageInput");
    const button = document.getElementById("sendBtn");
    const messages = document.getElementById("messages");

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

        } catch (err) {
            console.error("history error", err);
        }
    }

    loadHistory();

    // ================= SEND MESSAGE =================
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

            if (data.error) {
                addMessage("Ошибка: " + data.error, "ai");
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
