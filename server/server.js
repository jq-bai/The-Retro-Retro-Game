const http = require("http");
const fs = require("fs");
const path = require("path");
const express = require("express");

const app = express();
const host = "0.0.0.0"; // Bind to all available network interfaces
const port = process.env.PORT || 8000; // Use the port provided by Render

// Serve static files from the "local" directory
app.use(express.static(path.join(__dirname, "../local")));

// Handle requests for the main HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../local/main.html"));
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