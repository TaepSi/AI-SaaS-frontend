console.log("CHAT JS LOADED");

const API_URL = "https://ai-saas-site.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    console.log("CHAT READY");

    const form = document.getElementById("chatForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const input = document.getElementById("message").value;

        console.log("SENDING:", input);

        const res = await fetch(`${API_URL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: localStorage.getItem("user_id"),
                message: input
            })
        });

        const data = await res.json();

        console.log("RESPONSE:", data);
    });
});
