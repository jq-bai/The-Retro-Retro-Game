import React, { useState, useEffect, useRef } from 'react';

const GameStateInitial = ({ userList, displayName }) => {
    const eventSourceRef = useRef(null);
    const [board, setBoard] = useState(generateBoard(10, 10)); // 10x10 board

    useEffect(() => {
        console.log("Game has started");

        if (!eventSourceRef.current && displayName) {
            const eventSource = new EventSource(`/events?displayName=${displayName}`);
            eventSourceRef.current = eventSource;

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                // Handle other event types if needed
            };

            eventSource.onerror = (error) => {
                console.error("EventSource failed:", error);
                eventSource.close();
                eventSourceRef.current = null;
            };

            return () => {
                eventSource.close();
                eventSourceRef.current = null;
            };
        }

        // Notify the server that the GameStateInitial component has loaded
        fetch("/game-state-initial-loaded", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ displayName }),
        }).then(response => response.json())
          .then(data => console.log(data.message))
          .catch(error => console.error("Error notifying server:", error));

    }, [displayName]);

    useEffect(() => {
        console.log("All clients loaded");
    }, [userList]);

    const handleCellClick = (rowIndex, colIndex) => {
        const newBoard = board.map((row, rIdx) => 
            row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? 'X' : cell))
        );
        setBoard(newBoard);
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