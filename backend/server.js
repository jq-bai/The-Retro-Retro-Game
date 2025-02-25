const http = require("http");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const host = "0.0.0.0"; // Bind to all available network interfaces
const port = process.env.PORT || 8000; // Use the port provided by Render

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Store connected users
let users = [];
const maxUsers = 10;

// Store connected clients for SSE
let clients = [];

// Handle requests for the main HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// API endpoint to get the list of users
app.get("/api/users", (req, res) => {
    res.json(users.map(({ res, ...user }) => user));
});

// Handle submitName POST request
app.post("/submit-name", (req, res) => {
    const displayName = req.body.displayName;
    if (!displayName) {
        return res.status(400).json({ error: "Display name is required" });
    }

    if (users.length >= maxUsers) {
        return res.status(403).json({ error: "Server is full. Please try again later." });
    }

    const user = { displayName, ready: false, res: null };
    users.push(user);
    console.log(`Received display name: ${displayName}`);
    res.json({ message: `Welcome, ${displayName}!`, users: users.map(({ res, ...user }) => user) });
    broadcastUserList();
});

// Handle ready status POST request
app.post("/set-ready", (req, res) => {
    const displayName = req.body.displayName;
    const user = users.find(user => user.displayName === displayName);
    if (!user) {
        return res.status(404).json({ error: "Client not found" });
    }

    user.ready = !user.ready; // Toggle the ready status
    console.log(`Client ${displayName} is ${user.ready ? 'ready' : 'not ready'}`);
    res.json({ message: `${displayName} is ${user.ready ? 'ready' : 'not ready'}`, users: users.map(({ res, ...user }) => user) });
    broadcastUserList();

    // Check if all users are ready and there are at least 2 users
    if (users.length >= 2 && users.every(user => user.ready)) {
        broadcastStartGame();
    }
});

// SSE endpoint to send updates to clients
app.get("/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const displayName = req.query.displayName;
    if (!displayName) {
        res.status(400).send("Display name is required");
        return;
    }

    const user = users.find(user => user.displayName === displayName);
    if (user) {
        user.res = res;
    }

    clients.push(res);
    console.log(`Client connected: ${displayName}`);

    req.on("close", () => {
        clients = clients.filter(client => client !== res);
        users = users.filter(user => user.res !== res);
        console.log(`Client disconnected: ${displayName}`);
        broadcastUserList();
    });
});

// Endpoint to handle board updates
app.post("/update-board", (req, res) => {
    const { board } = req.body;
    console.log("Received board update request:", board); // Log the board update request
    if (!board) {
        return res.status(400).json({ error: "Board state is required" });
    }

    // Broadcast the updated board state to all connected clients
    console.log("Calling broadcastBoardUpdate with board:", board); // Log before calling the function
    broadcastBoardUpdate(board);
    res.json({ message: "Board updated" });
});

// Function to broadcast messages to all connected clients
function broadcastUserList() {
    const userList = JSON.stringify({ type: 'userList', users: users.map(({ res, ...user }) => user) });
    clients.forEach(client => {
        client.write(`data: ${userList}\n\n`);
    });
}

// Function to broadcast start game message to all connected clients
function broadcastStartGame() {
    const startGameMessage = JSON.stringify({ type: 'startGame' });
    clients.forEach(client => {
        client.write(`data: ${startGameMessage}\n\n`);
    });
    console.log("All clients ready, starting game..");
}

// Function to broadcast board updates to all connected clients
function broadcastBoardUpdate(board) {
    const boardUpdateMessage = JSON.stringify({ type: 'boardUpdate', board });
    clients.forEach(client => {
        client.write(`data: ${boardUpdateMessage}\n\n`);
        const user = users.find(user => user.res === client);
        if (user) {
            console.log(`Board update sent to client: ${user.displayName}`);
        }
    });
    console.log("Board state updated and broadcasted to all clients:", board);
}

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(port, host, (err) => {
    if (err) {
        console.error("Error starting server:", err);
        process.exit(1);
    }
    console.log(`Server is running on http://${host}:${port}`);
});

// Handle server shutdown
process.on('SIGINT', () => {
    console.log("Shutting down server...");
    cleanup();
    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
});

// Function to clean up data
function cleanup() {
    users = [];
    clients.forEach(client => client.end());
    clients = [];
    console.log("Server data cleared.");
}