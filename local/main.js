let displayName = null;
let eventSource = null;
let ready = false; // Define the ready variable
let users = []; // Store the users globally

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
            users = data.users; // Store the users globally
            updateUserList(users);

            // Initialize EventSource after displayName is set
            eventSource = new EventSource(`/events?displayName=${displayName}`);
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'userList') {
                    users = data.users; // Update the global users
                    updateUserList(users);
                } else if (data.type === 'startGame') {
                    startGame();
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
            ready = !ready; // Toggle the ready state
            updateReadyButton(); // Update the button appearance and text
            console.log(data.message);
            users = data.users; // Update the global users
            updateUserList(users);
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
        const listItem = document.createElement("li"); // Use "li" instead of "ul"
        listItem.textContent = user.displayName + (user.ready ? ' (Ready)' : '');
        userList.appendChild(listItem);
    });
}

function updateReadyButton() {
    const readyButton = document.getElementById("readyButton");
    if (ready) {
        readyButton.style.backgroundColor = "var(--color-grey)";
        readyButton.innerText = "I Want to Back Out :X";
    } else {
        readyButton.style.backgroundColor = "var(--color-white)";
        readyButton.innerText = "I'm Ready";
    }
}

function startGame() {
    document.getElementById("holdingScreen").style.display = "none";
    document.getElementById("startingScreen").style.display = "flex";
    setTimeout(goToGameState, 5000); // Transition to gameState after 5 seconds
}

function goToGameState() {
    document.getElementById("startingScreen").style.display = "none";
    document.getElementById("gameState").style.display = "flex";
    displayGameState(users, displayName); // Pass the users and displayName
}

function displayGameState(users, ownDisplayName) {
    const cardGrid = document.getElementById('cardGrid');
    cardGrid.innerHTML = ''; // Clear any existing cards

    users.forEach(user => {
        const card = document.createElement('div');
        card.classList.add('card');
        if (user.displayName === ownDisplayName) {
            card.classList.add('ownCard');
        }
        card.textContent = user.displayName;
        cardGrid.appendChild(card);
    });
}