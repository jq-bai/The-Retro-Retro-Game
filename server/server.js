const https = require("https");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const host = "0.0.0.0"; // Bind to all available network interfaces
const port = process.env.PORT || 10000; // Use the port provided by Render

// Decode base64 encoded SSL certificate and key
const sslKey = fs.readFileSync(path.join(__dirname, "../ssl/private.key"));
const sslCert = fs.readFileSync(path.join(__dirname, "../ssl/certificate.crt"));

// Load SSL certificate and key
const options = {
    key: sslKey,
    cert: sslCert
};

/* Initial load in of page */
const firstLoad = function(req, res) {
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

    fsPromises.readFile(filePath)
        .then(contents => {
            res.setHeader("Content-Type", contentType);
            res.writeHead(200);
            res.end(contents);
        })
        .catch(err => {
            res.writeHead(500);
            res.end("Server Error");
        });
};

/* Server start */
const server = https.createServer(options, firstLoad);


/* Server live check */
server.listen(port, host, (err) => {
    if (err) {
        console.error("Error starting server:", err);
        process.exit(1);
    }
    console.log(`Server is running on https://${host}:${port}`);
});