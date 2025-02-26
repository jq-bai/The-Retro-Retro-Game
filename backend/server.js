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

// Store scores
let scores = {};

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
    scores[displayName] = 0; // Initialize score for the new user
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
        delete scores[displayName]; // Remove the user's score
        console.log(`Client disconnected: ${displayName}`);
        broadcastUserList();
    });
});

// Endpoint to handle board updates
app.post("/update-board", (req, res) => {
    const { board, revealedCells, scores: updatedScores, displayName } = req.body;
    console.log("Received board update request:", board, revealedCells, updatedScores, displayName); // Log the board update request
    if (!board || !revealedCells || !displayName || !updatedScores) {
        return res.status(400).json({ error: "Board state, revealed cells, scores, and display name are required" });
    }

    // Check if it's the current player's turn
    const currentPlayer = users[currentPlayerIndex];
    if (currentPlayer.displayName !== displayName) {
        return res.status(403).json({ error: "It's not your turn" });
    }

    // Update scores
    scores = updatedScores;

    // Broadcast the updated board state and scores to all connected clients
    console.log("Calling broadcastBoardUpdate with board:", board, revealedCells, scores); // Log before calling the function
    broadcastBoardUpdate(board, revealedCells, scores);

    // Rotate to the next player
    currentPlayerIndex = (currentPlayerIndex + 1) % users.length;
    broadcastCurrentPlayer();

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
let currentBoard = null; // Variable to store the generated board
let currentPlayerIndex = 0; // Variable to track the current player's turn

function broadcastStartGame() {
    currentBoard = generateMinesweeperBoard(); // Generate and store the board
    currentPlayerIndex = Math.floor(Math.random() * users.length); // Pick a random client to start first
    const startGameMessage = JSON.stringify({ type: 'startGame' });
    clients.forEach(client => {
        client.write(`data: ${startGameMessage}\n\n`);
    });
    console.log("All clients ready, starting game with board generated.");
    broadcastCurrentPlayer();
}

// Function to broadcast board updates to all connected clients
function broadcastBoardUpdate(board, revealedCells, scores) {
    const boardUpdateMessage = JSON.stringify({ type: 'boardUpdate', board, revealedCells, scores });
    clients.forEach(client => {
        client.write(`data: ${boardUpdateMessage}\n\n`);
        const user = users.find(user => user.res === client);
        if (user) {
            console.log(`Board update sent to client: ${user.displayName}`);
        }
    });
    console.log("Board state updated and broadcasted to all clients:", board);

    // Check if all cells are revealed
    const allCellsRevealed = revealedCells.every(row => row.every(cell => cell));
    if (allCellsRevealed) {
        console.log("All cells revealed, broadcasting game end event");
        broadcastGameEnd();
    }
}

// Function to broadcast the current player's turn to all connected clients
function broadcastCurrentPlayer() {
    const currentPlayer = users[currentPlayerIndex];
    const currentPlayerMessage = JSON.stringify({ type: 'currentPlayer', displayName: currentPlayer.displayName });
    clients.forEach(client => {
        client.write(`data: ${currentPlayerMessage}\n\n`);
    });
    console.log(`Current player is: ${currentPlayer.displayName}`);
}

// Function to broadcast game end event to all connected clients
function broadcastGameEnd() {
    // Find the user with the highest score
    let highestScore = -Infinity;
    let winner = null;
    for (const [displayName, score] of Object.entries(scores)) {
        if (score > highestScore) {
            highestScore = score;
            winner = displayName;
        }
    }

    const gameEndMessage = JSON.stringify({ type: 'gameEnd', winner });
    clients.forEach(client => {
        client.write(`data: ${gameEndMessage}\n\n`);
    });
    console.log(`Game end event broadcasted to all clients. Winner: ${winner}`);
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

// Function to generate a 10x10 Minesweeper board with 30 mines
function generateMinesweeperBoard() {
    const rows = 10;
    const cols = 10;
    const minesCount = 30;
    const board = Array.from({ length: rows }, () => Array(cols).fill(0));

    let minesPlaced = 0;
    while (minesPlaced < minesCount) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);

        if (board[row][col] === 0) {
            board[row][col] = '💣'; // Use bomb emoji instead of 'M'
            minesPlaced++;
        }
    }

    // Function to count mines around a given cell
    const countMines = (row, col) => {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && board[newRow][newCol] === '💣') {
                    count++;
                }
            }
        }
        return count;
    };

    // Update each cell with the count of adjacent mines
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (board[row][col] !== '💣') {
                board[row][col] = countMines(row, col);
            }
        }
    }

    return board;
}

// Endpoint to generate a new Minesweeper board
app.get("/generate-board", (req, res) => {
    if (!currentBoard) {
        currentBoard = generateMinesweeperBoard();
    }
    console.log("Returning generated Minesweeper board:", currentBoard);
    res.json({ board: currentBoard });
});

// Endpoint to get the initial player
app.get("/initial-player", (req, res) => {
    const currentPlayer = users[currentPlayerIndex];
    res.json({ displayName: currentPlayer.displayName });
});

// Endpoint to get the initial scores
app.get("/initial-scores", (req, res) => {
    res.json({ scores });
});