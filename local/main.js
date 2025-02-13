let ws;

function joinGame() {
    console.log("Joining a game");
    document.getElementById("welcomeScreen").style.display = "none";
    document.getElementById("nameFormScreen").style.display = "flex";
}

function submitName() {
    const displayName = document.getElementById("displayName").value;

    if (!displayName) {
        alert("Please enter a non-invisible name.");
        return;
    }

    const host = window.location.hostname;
    const port = window.location.port || 443; // Use the current port or default to 443 for HTTPS/WSS
    ws = new WebSocket(`wss://${host}:${port}`);

    ws.onopen = () => {
        console.log('WebSocket connection opened');
        ws.send(JSON.stringify({ displayName }));
    };

    ws.onmessage = (event) => {
        console.log('Received message from server:', event.data);
        const data = JSON.parse(event.data);

        if (data.message) {
            document.getElementById("nameFormScreen").style.display = "none";
            document.getElementById("holdingScreen").style.display = "flex";
            document.getElementById("message").innerText = data.message;
        }
        if (data.displayNames) {
            const userList = document.getElementById("userList");
            userList.innerHTML = ""; // Clear the existing list
            data.displayNames.forEach(name => {
                const listItem = document.createElement("li");
                listItem.textContent = name;
                userList.appendChild(listItem);
            });
        }
        if (data.startGame) {
            document.getElementById("signUpConfirmScreen").style.display = "none";
            document.getElementById("startingScreen").style.display = "flex";
            document.getElementById("message").innerText = data.displayNames;
        }
    };

    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
        console.log("WebSocket connection closed");
    };
}