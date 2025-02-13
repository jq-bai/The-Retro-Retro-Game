let displayName = null;
let eventSource = null;

function joinGame() {
    console.log("Joining a game");
    document.getElementById("welcomeScreen").style.display = "none";
    document.getElementById("nameFormScreen").style.display = "flex";
}

async function submitName() {
    displayName = document.getElementById("displayName").value;

    if (!displayName) {
        alert("Please enter a non-invisible name.");
        return;
    }

    try {
        const response = await fetch("/submit-name", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ displayName })
        });
        const data = await response.json();
        if (response.ok) {
            console.log(data.message);
            document.getElementById("nameFormScreen").style.display = "none";
            document.getElementById("holdingScreen").style.display = "flex";
            document.getElementById("message").innerText = data.message;
            updateUserList(data.users);

            // Initialize EventSource after displayName is set
            eventSource = new EventSource(`/events?displayName=${displayName}`);
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'userList') {
                    updateUserList(data.users);
                }
            };
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error("Error submitting name:", error);
    }
}

async function setReady() {
    try {
        const response = await fetch("/set-ready", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ displayName })
        });
        const data = await response.json();
        if (response.ok) {
            console.log(data.message);
            updateUserList(data.users);
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error("Error setting ready status:", error);
    }
}

function updateUserList(users) {
    const userList = document.getElementById("userList");
    userList.innerHTML = ""; // Clear the existing list
    users.forEach(user => {
        const listItem = document.createElement("ul");
        listItem.textContent = user.displayName + (user.ready ? ' (Ready)' : '');
        userList.appendChild(listItem);
    });
}