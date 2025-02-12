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

    ws = new WebSocket("ws://192.168.18.28:8000");

    ws.onopen = () => {
        ws.send(JSON.stringify({ displayName }));
    };

    ws.onmessage = (event) => {
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