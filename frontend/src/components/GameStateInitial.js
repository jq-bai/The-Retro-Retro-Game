/*
    This is the main game state
*/

import React, { useState, useEffect, useRef } from 'react'; // Imports the useState, useEffect, and useRef hooks from React
import { DotLottieReact } from '@lottiefiles/dotlottie-react'; // Imports the DotLottieReact component from the DotLottieReact library

// GameStateInitial component with userList, displayName, eventSource, setCurrentScreen, and setWinner prop
const GameStateInitial = ({ userList, displayName, eventSource, setCurrentScreen, setWinner }) => {
    const [board, setBoard] = useState([]); // State variable to track the game board
    const [revealedCells, setRevealedCells] = useState([]); // State variable to track the revealed cells
    const [currentPlayer, setCurrentPlayer] = useState(null); // State variable to track the current player
    const [scores, setScores] = useState({}); // State variable to track the scores of all connected clients
    const [dotLottie, setDotLottie] = React.useState(null); // State variable to track the DotLottie animation
    const [lastActionMessage, setLastActionMessage] = useState('Game has started'); // State variable to track the last action message

    // Function to handle the DotLottie animation
    const dotLottieRefCallback = (dotLottie) => {
        setDotLottie(dotLottie);
    };

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
                } else if (data.type === 'lastAction') {
                    console.log("Last action received:", data.message);
                    setLastActionMessage(data.message);
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
        if (revealedCells[rowIndex][colIndex] || currentPlayer !== displayName) return; // Prevents clicking on the same cell more than once or if it's not the player's turn

        const newRevealedCells = revealedCells.map((row, rIdx) => 
            row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? true : cell))
        );
        setRevealedCells(newRevealedCells);

        const isMine = board[rowIndex][colIndex] === '💣';
        const scoreChange = isMine ? -1 : 1;
        const newScores = { ...scores, [displayName]: (scores[displayName] || 0) + scoreChange };
        setScores(newScores);

        // Sends the updated board state and scores to the server
        fetch("/update-board", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ board, revealedCells: newRevealedCells, scores: newScores, displayName, lastOpenedCell: { row: rowIndex, col: colIndex } }),
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

        // Plays the Lottie animation once when a cell is clicked
        if (dotLottie) {
            dotLottie.play();
        }
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
            {/* Display the last action message */}
            {lastActionMessage && <div className="last-action-message">{lastActionMessage}</div>}
            <br />
            <DotLottieReact
                src="https://lottie.host/6acb6297-3b63-47fa-90ff-a552ade44993/hSVEweDdDh.lottie"
                loop={false}
                autoplay={true}
                dotLottieRefCallback={dotLottieRefCallback}
                style={{ width: 'var(--size-large)', height: 'var(--size-large)' }}
            />
            {/* DEV BUTTON */}
            {/* <button onClick={revealAllCells}>Reveal All Cells</button> */}
        </div>
    );

    // DEV FUNCTIONS
    // Function to reveal all cells for testing purposes
    const revealAllCells = () => {
        const newRevealedCells = revealedCells.map(row => row.map(() => true));
        setRevealedCells(newRevealedCells);
        console.log("All cells revealed for testing purposes");
        const newScores = { ...scores };
        const dataToSend = { board, revealedCells: newRevealedCells, scores: newScores, displayName, lastOpenedCell: { row: 1, col: 1 } };
        console.log("Sending data to server:", dataToSend);
        fetch("/update-board", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSend),
        }).catch(error => console.error("Error updating board:", error));
    };
};

export default GameStateInitial;