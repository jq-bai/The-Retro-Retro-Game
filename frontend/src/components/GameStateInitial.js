import React, { useState, useEffect } from 'react';

const GameStateInitial = ({ userList, displayName, eventSource }) => {
    const [board, setBoard] = useState([]);
    const [revealedCells, setRevealedCells] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [scores, setScores] = useState({});

    useEffect(() => {
        console.log("useEffect triggered with displayName:", displayName);

        if (eventSource) {
            eventSource.onmessage = (event) => {
                console.log("Event received:", event.data); // Log any event received
                const data = JSON.parse(event.data);
                if (data.type === 'boardUpdate') {
                    console.log("Board update received:", data.board, data.revealedCells, data.scores); // Log the board update
                    setBoard(data.board);
                    setRevealedCells(data.revealedCells);
                    setScores(data.scores);
                } else if (data.type === 'currentPlayer') {
                    console.log("Current player update received:", data.displayName); // Log the current player update
                    setCurrentPlayer(data.displayName);
                } else if (data.type === 'scoreUpdate') {
                    console.log("Score update received:", data.scores); // Log the score update
                    setScores(data.scores);
                }
                // Handle other event types if needed
            };

            eventSource.onerror = (error) => {
                console.error("EventSource failed:", error);
                eventSource.close();
            };
        }
    }, [displayName, eventSource]);

    useEffect(() => {
        console.log("All clients loaded");
    }, [userList]);

    useEffect(() => {
        // Fetch the initial board from the server
        fetch("/generate-board")
            .then(response => response.json())
            .then(data => {
                console.log("Fetched initial board:", data.board);
                setBoard(data.board);
                setRevealedCells(Array.from({ length: data.board.length }, () => Array(data.board[0].length).fill(false)));
            })
            .catch(error => console.error("Error fetching initial board:", error));

        // Fetch the initial player from the server
        fetch("/initial-player")
            .then(response => response.json())
            .then(data => {
                console.log("Fetched initial player:", data.displayName);
                setCurrentPlayer(data.displayName);
            })
            .catch(error => console.error("Error fetching initial player:", error));

        // Fetch the initial scores from the server
        fetch("/initial-scores")
            .then(response => response.json())
            .then(data => {
                console.log("Fetched initial scores:", data.scores);
                setScores(data.scores);
            })
            .catch(error => console.error("Error fetching initial scores:", error));
    }, []);

    const handleCellClick = (rowIndex, colIndex) => {
        if (revealedCells[rowIndex][colIndex] || currentPlayer !== displayName) return; // Prevent clicking on the same cell more than once or if it's not the player's turn

        const newRevealedCells = revealedCells.map((row, rIdx) => 
            row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? true : cell))
        );
        setRevealedCells(newRevealedCells);

        const isMine = board[rowIndex][colIndex] === 'M'; // Assuming 'M' represents a mine
        const scoreChange = isMine ? -1 : 1;
        const newScores = { ...scores, [displayName]: (scores[displayName] || 0) + scoreChange };
        setScores(newScores);

        console.log("Sending updated board state and scores to server:", board, newRevealedCells, newScores); // Log the updated board state and scores

        // Send the updated board state and scores to the server
        fetch("/update-board", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ board, revealedCells: newRevealedCells, scores: newScores, displayName }),
        }).catch(error => console.error("Error updating board:", error));
    };

    return (
        <div className="hero center">
            <div className="user-grid">
                {userList.filter(user => user.displayName).map(user => (
                    <div key={user.displayName} className="user-card-container">
                        <div className="user-card">
                            {user.displayName} {user.displayName === displayName && "(You)"}
                            <div>Score: {scores[user.displayName] || 0}</div>
                        </div>
                    </div>
                ))}
            </div>
            <br />
            <div className="board">
                {board.map((row, rowIndex) => (
                    <div key={rowIndex} className="board-row">
                        {row.map((cell, colIndex) => (
                            <div 
                                key={colIndex} 
                                className="board-cell" 
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                            >
                                {revealedCells[rowIndex][colIndex] ? cell : ''}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameStateInitial;