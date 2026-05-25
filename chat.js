console.log("CHAT JS LOADED");

const API_URL = "https://ai-saas-backend-production-5083.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
    console.log("CHAT READY");

    const input = document.getElementById("messageInput");
    const button = document.getElementById("sendBtn");
    const messages = document.getElementById("messages");

    function addMessage(text, type) {
        const div = document.createElement("div");

        // ВАЖНО: совпадает с твоим CSS
        div.className = `message ${type}`;

        div.textContent = text;

        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    button.addEventListener("click", async () => {
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

            if (data.error) {
                addMessage("Ошибка: " + data.error, "ai");
                return;
            }

            addMessage(data.reply, "ai");

        } catch (err) {
            console.error(err);
            addMessage("Сервер недоступен", "ai");
        }
    });
});
