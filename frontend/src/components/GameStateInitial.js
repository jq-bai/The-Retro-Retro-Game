import React, { useState, useEffect, useRef } from 'react';

const GameStateInitial = ({ userList, displayName }) => {
    const [currentPrompt, setCurrentPrompt] = useState("Click to Reveal Your Prompt");
    const [isClicked, setIsClicked] = useState(false);
    const [commonPrompt, setCommonPrompt] = useState("");
    const [differentPrompt, setDifferentPrompt] = useState("");
    const [differentPromptUser, setDifferentPromptUser] = useState("");
    const eventSourceRef = useRef(null);

    useEffect(() => {
        console.log("Game has started");

        if (!eventSourceRef.current && displayName) {
            const eventSource = new EventSource(`/events?displayName=${encodeURIComponent(displayName)}`);
            eventSourceRef.current = eventSource;

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'promptAssignment') {
                    setCommonPrompt(data.commonPrompt);
                    setDifferentPrompt(data.differentPrompt);
                    setDifferentPromptUser(data.differentPromptUser);
                    console.log("Prompt received from server:", data);
                }
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

    const handlePromptClick = () => {
        if (!isClicked) {
            if (displayName === differentPromptUser) {
                setCurrentPrompt(differentPrompt);
            } else {
                setCurrentPrompt(commonPrompt);
            }
            setIsClicked(true);
        }
    };

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
                        <br />
                        <button className="cta">Vote</button>
                    </div>
                ))}
            </div>
            <br />
            <br />
            <br />
            <br />
            <div>
                <div className="prompt-card center" onClick={handlePromptClick}>
                    <h2>{currentPrompt}</h2>
                </div>
            </div>
        </div>
    );
};

export default GameStateInitial;