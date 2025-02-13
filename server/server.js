const https = require("https");
const fs = require("fs");
const path = require("path");

const host = "0.0.0.0"; // Bind to all available network interfaces
const port = process.env.PORT || 10000; // Use the port provided by Render

// Load SSL certificate and key from files
const options = {
    key: fs.readFileSync(path.join(__dirname, "../ssl/private.key")),
    cert: fs.readFileSync(path.join(__dirname, "../ssl/certificate.crt"))
};

// Function to handle requests
const requestHandler = (req, res) => {
    let filePath = "";
    let contentType = "";

    if (req.url === "/") {
        filePath = path.join(__dirname, "../local/main.html");
        contentType = "text/html";
    } else if (req.url === "/main.js") {
        filePath = path.join(__dirname, "../local/main.js");
        contentType = "application/javascript";
    } else if (req.url === "/ds.css") {
        filePath = path.join(__dirname, "../local/ds.css");
        contentType = "text/css";
    } else {
        res.writeHead(404);
        res.end("Not Found");
        return;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(500);
            res.end("Server Error");
            return;
        }
        res.setHeader("Content-Type", contentType);
        res.writeHead(200);
        res.end(content);
    });
};

// Create HTTPS server
const server = https.createServer(options, requestHandler);

// Start server
server.listen(port, host, (err) => {
    if (err) {
        console.error("Error starting server:", err);
        process.exit(1);
    }
    console.log(`Server is running on https://${host}:${port}`);
});