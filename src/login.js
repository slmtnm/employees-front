import { config } from "./config";

export function loginEventListener(event) {
    event.preventDefault();
    const username = document.getElementById("inputLogin").value;
    const password = document.getElementById("inputPassword").value;

    fetch(`${config.serverAddr}/api/auth/login`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    })
        .then(response => {
            if (response.status == 401) {
                throw new Error("Invalid username or password");
            } else if (response.status == 422) {
                throw new Error("Incorrect username or password format");
            }

            return response.json();
        })
        .then(response => {
            if (!('token' in response)) {
                throw new Error("Invalid answer from server");
            }
            localStorage.setItem("token", response.token);
            location.reload();
        })
        .catch(err => {
            const errorMessage = document.getElementById("login-error-msg");
            errorMessage.textContent = err.message;
            errorMessage.style.opacity = 1;
        });
}
