const https = require("https");
const WebSocket = require("ws");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const axios = require("axios");

const host = "0.0.0.0"; // Bind to all available network interfaces
const port = process.env.PORT || 8000; // Use the port provided by Render

// Load SSL certificate and key from environment variables or default paths
const options = {
    key: process.env.SSL_KEY || fs.readFileSync('ssl/private.key'), // Replace with the path to your private key
    cert: process.env.SSL_CERT || fs.readFileSync('ssl/certificate.crt') // Replace with the path to your certificate
};

/* Function to get the public IP address */
const getPublicIpAddress = async () => {
    try {
        const response = await axios.get('https://api.ipify.org?format=json');
        return response.data.ip;
    } catch (error) {
        console.error("Error fetching public IP address:", error);
        return null;
    }
};

/* Initial load in of page */
const firstLoad = async function(req, res) {
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
    } else if (req.url === "/public-ip") {
        const publicIp = await getPublicIpAddress();
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        res.end(JSON.stringify({ publicIp }));
        return;
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
const wss = new WebSocket.Server({ server });

let connections = [];
const maxConnections = 5;
let displayNames = [];

/* Function to broadcast the list of display names to all clients */
const broadcastDisplayNames = () => {
    const message = JSON.stringify({ displayNames });
    connections.forEach(conn => conn.send(message));
};

/* Starting user management */
wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    if (connections.length >= maxConnections) {
        ws.send(JSON.stringify({ error: 'Server is busy. Please try again later.' }));
        ws.close();
        return;
    }

    connections.push(ws);
    const userIndex = connections.length - 1;

    ws.on('message', (message) => {
        console.log('Received message:', message);
        const data = JSON.parse(message);
        if (data.displayName) {
            displayNames[userIndex] = data.displayName;
            ws.send(JSON.stringify({ message: `Welcome, ${data.displayName}!` }));
            broadcastDisplayNames();
            console.log(`${data.displayName} connected.`);
            if (displayNames.length === maxConnections && displayNames.every(name => name !== undefined)) {
                // All users have connected and submitted their names
                connections.forEach((conn, index) => {
                    conn.send(JSON.stringify({ message: 'All users connected. Game is starting soon.', displayNames, startGame: true }));
                });
                console.log(`All users connected, game starting.`);
            }
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
        connections = connections.filter(conn => conn !== ws);
        displayNames = displayNames.filter((_, index) => index !== userIndex);
        broadcastDisplayNames();
    });
});

/* Server live check */
server.listen(port, host, async () => {
    const publicIp = await getPublicIpAddress();
    if (publicIp) {
        console.log(`Server is running on https://${host}:${port}`);
        console.log(`Public IP address: ${publicIp}`);
    } else {
        console.log(`Server is running on https://${host}:${port}`);
        console.log("Could not fetch public IP address.");
    }
});