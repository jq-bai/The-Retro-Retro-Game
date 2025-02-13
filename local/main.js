let ws;

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
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error("Error submitting name:", error);
    }
}