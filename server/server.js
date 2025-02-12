const http = require("http");
const WebSocket = require("ws");
const fs = require("fs").promises;
const path = require("path");

const host = "192.168.18.28";
const port = 8000;

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

    fs.readFile(filePath)
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
const server = http.createServer(firstLoad);
const wss = new WebSocket.Server({server});

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
    if (connections.length >= maxConnections) {
        ws.send(JSON.stringify({ error: 'Server is busy. Please try again later.' }));
        ws.close();
        return;
    }

    connections.push(ws);
    const userIndex = connections.length - 1;

    ws.on('message', (message) => {
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
        connections = connections.filter(conn => conn !== ws);
        displayNames = displayNames.filter((_, index) => index !== userIndex);
        broadcastDisplayNames();
    });
});

/* Server live check */
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});