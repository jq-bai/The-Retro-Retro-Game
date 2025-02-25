import React, { useState, useEffect, useRef } from 'react';

const GameStateInitial = ({ userList, displayName }) => {
    const eventSourceRef = useRef(null);
    const [board, setBoard] = useState(generateBoard(10, 10)); // 10x10 board

    useEffect(() => {
        console.log("useEffect triggered with displayName:", displayName);

        if (!eventSourceRef.current && displayName) {
            console.log("Creating new EventSource for displayName:", displayName);
            const eventSource = new EventSource(`/events?displayName=${displayName}`);
            eventSourceRef.current = eventSource;

            eventSource.onmessage = (event) => {
                console.log("Event received:", event.data); // Log any event received
                const data = JSON.parse(event.data);
                if (data.type === 'boardUpdate') {
                    console.log("Board update received:", data.board); // Log the board update
                    setBoard(data.board);
                }
                // Handle other event types if needed
            };

            eventSource.onerror = (error) => {
                console.error("EventSource failed:", error);
                eventSource.close();
                eventSourceRef.current = null;
            };

            return () => {
                console.log("Closing EventSource");
                eventSource.close();
                eventSourceRef.current = null;
            };
        }
    }, [displayName]);

    useEffect(() => {
        console.log("All clients loaded");
    }, [userList]);

    const handleCellClick = (rowIndex, colIndex) => {
        const newBoard = board.map((row, rIdx) => 
            row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? 'X' : cell))
        );
        setBoard(newBoard);

        console.log("Sending updated board state to server:", newBoard); // Log the updated board state

        // Send the updated board state to the server
        fetch("/update-board", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ board: newBoard }),
        }).catch(error => console.error("Error updating board:", error));
    };

    return (
        <div className="hero center">
            <div className="user-grid">
                {userList.filter(user => user.displayName).map(user => (
                    <div key={user.displayName} className="user-card-container">
                        <div className="user-card">
                            {user.displayName}
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
                                {cell}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

const generateBoard = (rows, cols) => {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ''));
};

export default GameStateInitial;