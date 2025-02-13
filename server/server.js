const https = require("https");
const fs = require("fs");
const path = require("path");
const express = require("express");

const app = express();
const host = "0.0.0.0"; // Bind to all available network interfaces
const PORT = process.env.PORT || 3000; // Use the port provided by Render

// Load SSL certificate and key from files
const options = {
    key: fs.readFileSync(path.join(__dirname, "../ssl/private.key")),
    cert: fs.readFileSync(path.join(__dirname, "../ssl/certificate.crt"))
};

// Serve static files from the "local" directory
app.use(express.static(path.join(__dirname, "../local")));

// Handle requests for the main HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../local/main.html"));
});

// Create HTTPS server
const server = https.createServer(options, app);

// Start server
server.listen(PORT, host, (err) => {
    if (err) {
        console.error("Error starting server:", err);
        process.exit(1);
    }
    console.log(`Server is running on https://${host}:${PORT}`);
});