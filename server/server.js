const http = require("http");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const host = "0.0.0.0"; // Bind to all available network interfaces
const port = process.env.PORT || 8000; // Use the port provided by Render

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the "local" directory
app.use(express.static(path.join(__dirname, "../local")));

// Store connected users
let users = [];
const maxUsers = 10;

// Store connected clients for SSE
let clients = [];

// Handle requests for the main HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../local/main.html"));
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
        return res.status(404).json({ error: "User not found" });
    }

    user.ready = true;
    console.log(`User ${displayName} is ready`);
    res.json({ message: `${displayName} is ready`, users: users.map(({ res, ...user }) => user) });
    broadcastUserList();
});

// SSE endpoint to send updates to clients
app.get("/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const displayName = req.query.displayName;
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

// Function to broadcast messages to all connected clients
function broadcastUserList() {
    const userList = JSON.stringify({ type: 'userList', users: users.map(({ res, ...user }) => user) });
    clients.forEach(client => {
        client.write(`data: ${userList}\n\n`);
    });
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