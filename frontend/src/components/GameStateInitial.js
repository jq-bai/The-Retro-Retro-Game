/*
    This is the main game state
*/

import React, { useState, useEffect } from 'react'; // Imports the useState and useEffect hooks from React

// GameStateInitial component with userList, displayName, eventSource, setCurrentScreen, and setWinner prop
const GameStateInitial = ({ userList, displayName, eventSource, setCurrentScreen, setWinner }) => {
    const [board, setBoard] = useState([]);
    const [revealedCells, setRevealedCells] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [scores, setScores] = useState({});
    
    // useEffect hook to handle the EventSource connection
    useEffect(() => {
        if (eventSource) {
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);

                // Handling different types of events from the server
                if (data.type === 'boardUpdate') {
                    console.log("Board update received:", data.board, data.revealedCells, data.scores);
                    setBoard(data.board);
                    setRevealedCells(data.revealedCells);
                    setScores(data.scores);
                } else if (data.type === 'currentPlayer') {
                    console.log("Current player update received:", data.displayName);
                    setCurrentPlayer(data.displayName);
                } else if (data.type === 'gameEnd') {
                    console.log("Game end received:", data.winner);
                    setWinner(data.winner);
                    setCurrentScreen('gameStateEnd');
                }
            };

            // Error handling for the EventSource connection
            eventSource.onerror = (error) => {
                console.error("EventSource failed:", error);
                eventSource.close();
            };
        }
    }, [displayName, eventSource, setCurrentScreen, setWinner]);

    // useEffect hook to handle the userList
    useEffect(() => {}, [userList]);

    // useEffect hook to fetch the initial board, player, and scores from the server
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

    // Function to handle cell clicks
    const handleCellClick = (rowIndex, colIndex) => {
        if (revealedCells[rowIndex][colIndex] || currentPlayer !== displayName) return; // Prevent clicking on the same cell more than once or if it's not the player's turn

        const newRevealedCells = revealedCells.map((row, rIdx) => 
            row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? true : cell))
        );
        setRevealedCells(newRevealedCells);

        const isMine = board[rowIndex][colIndex] === '💣';
        const scoreChange = isMine ? -1 : 1;
        const newScores = { ...scores, [displayName]: (scores[displayName] || 0) + scoreChange };
        setScores(newScores);

        // Send the updated board state and scores to the server
        fetch("/update-board", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ board, revealedCells: newRevealedCells, scores: newScores, displayName }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Server response:", data);
        })
        .catch(error => console.error("Error updating board:", error));
        console.log("Sending updated board state and scores to server:", board, newRevealedCells, newScores);
    };

    // DEV FUNCTION
    const revealAllCells = () => {
        const newRevealedCells = revealedCells.map(row => row.map(() => true));
        setRevealedCells(newRevealedCells);
        console.log("All cells revealed for testing purposes");
        const newScores = { ...scores };
        const dataToSend = { board, revealedCells: newRevealedCells, scores: newScores, displayName };
        console.log("Sending data to server:", dataToSend);
        fetch("/update-board", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSend),
        }).catch(error => console.error("Error updating board:", error));
    };

    // Renders JSX visual elements
    return (
        <div className="hero center">
            <div className="user-grid">
                {userList.filter(user => user.displayName).map(user => (
                    <div key={user.displayName} className="user-card-container">
                        <div className={`user-card ${user.displayName === currentPlayer ? 'current-player' : ''}`}>
                            {user.displayName === displayName ? "You" : user.displayName}
                            <div> Score:{scores[user.displayName] || 0}</div>
                        </div>
                    </div>
                ))}
            </div>
            <br />
            <br />
            <div className="board">
                {board.map((row, rowIndex) => (
                    <div key={rowIndex} className="board-row">
                        {row.map((cell, colIndex) => (
                            <div 
                                key={colIndex} 
                                className={`board-cell ${revealedCells[rowIndex][colIndex] && board[rowIndex][colIndex] === '💣' ? 'mine' : ''}`} 
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                            >
                                {revealedCells[rowIndex][colIndex] ? cell : ''}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <br />
            {/* DEV BUTTON */}
            <button onClick={revealAllCells}>Reveal All Cells</button>
        </div>
    );
};

export default GameStateInitial;