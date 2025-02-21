import React, { useState, useEffect, useRef } from 'react';

const GameStateInitial = ({ userList, displayName }) => {
    const eventSourceRef = useRef(null);

    useEffect(() => {
        console.log("Game has started");

        if (!eventSourceRef.current && displayName) {
            const eventSource = new EventSource(`/events`);
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
        </div>
    );
};

export default GameStateInitial;