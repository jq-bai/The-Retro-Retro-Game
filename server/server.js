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

// Handle requests for the main HTML file
app.get("/", (req, res) => {
    console.log('HTML file served');
    res.sendFile(path.join(__dirname, "../local/main.html"));
});

// Store connected users
let users = [];
const maxUsers = 10;

// Handle submitName POST request
app.post("/submit-name", (req, res) => {
    const displayName = req.body.displayName;
    if (!displayName) {
        return res.status(400).json({ error: "Display name is required" });
    }

    if (users.length >= maxUsers) {
        return res.status(403).json({ error: "Server is full. Please try again later." });
    }
    users.push(displayName);
    res.json({ message: `Welcome, ${displayName}!`, users });
    console.log(`Received display name: ${displayName}`);
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
    res.json({ message: `${displayName} is ready`, users });
});

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