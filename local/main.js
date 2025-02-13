let ws;

async function getPublicIp() {
    try {
        const response = await fetch('/public-ip');
        const data = await response.json();
        console.log('Fetched public IP:', data.publicIp);
        return data.publicIp;
    } catch (error) {
        console.error("Error fetching public IP address:", error);
        return null;
    }
}

function joinGame() {
    console.log("Joining a game");
    document.getElementById("welcomeScreen").style.display = "none";
    document.getElementById("nameFormScreen").style.display = "flex";
}

async function submitName() {
    const displayName = document.getElementById("displayName").value;

    if (!displayName) {
        alert("Please enter a non-invisible name.");
        return;
    }

    const publicIp = await getPublicIp();
    if (!publicIp) {
        alert("Could not fetch public IP address. Please try again later.");
        return;
    }

    const port = 8000;
    ws = new WebSocket(`wss://${publicIp}:${port}`);

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