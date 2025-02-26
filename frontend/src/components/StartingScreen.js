/*
    This initiates the countdown to start the game once all clients are ready
*/

import React, { useState, useEffect } from 'react'; // Imports the useState and useEffect hooks from React

// StartingScreen component with a userList and onCountdownComplete prop
const StartingScreen = ({ userList, onCountdownComplete }) => {
    const [countdown, setCountdown] = useState(5); // State variable to track the countdown

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prevCountdown => {
                if (prevCountdown === 1) {
                    clearInterval(timer);
                    onCountdownComplete();
                }
                return prevCountdown - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onCountdownComplete]);

    // Renders JSX visual elements
    return (
        <div className="hero center">
            <h2 id="message">Game is Starting in {countdown} Seconds</h2>
            <br />
            <div className="listBox">
                <h3>Players in the Game</h3>
                <br />
                <ul>
                    {userList.map((user, index) => (
                        <li key={index}>
                            {user.displayName}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default StartingScreen;