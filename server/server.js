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

// Handle submitName POST request
app.post("/submit-name", (req, res) => {
    const displayName = req.body.displayName;
    if (!displayName) {
        return res.status(400).json({ error: "Display name is required" });
    }
    // Handle the display name (e.g., store it, broadcast it, etc.)
    console.log(`Received display name: ${displayName}`);
    res.json({ message: `Welcome, ${displayName}!` });
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