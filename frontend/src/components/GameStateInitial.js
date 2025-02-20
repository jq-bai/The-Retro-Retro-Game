import React, { useState, useEffect, useRef } from 'react';

const GameStateInitial = ({ userList, displayName }) => {
    const prompts = [
        "Describe the past month of work",
        "Describe crybaby",
        "Describe bill split",
        "Describe onboarding",
        "Describe tokens",
        "Describe the huddle room",
        "Describe the roadmap",
        "Describe the current workflow process",
        "Describe your current project",
        "Describe Figma",
    ];

    const [currentPrompt, setCurrentPrompt] = useState("Click to Reveal Your Prompt");
    const [isClicked, setIsClicked] = useState(false);
    const eventSourceRef = useRef(null);

    useEffect(() => {
        console.log("Game has started");

        if (!eventSourceRef.current && displayName) {
            const eventSource = new EventSource(`/events?displayName=${encodeURIComponent(displayName)}`);
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
    }, [displayName]);

    const handlePromptClick = () => {
        if (!isClicked) {
            const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
            setCurrentPrompt(randomPrompt);
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