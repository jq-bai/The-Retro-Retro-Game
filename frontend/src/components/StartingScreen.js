import React, { useState, useEffect } from 'react';

const StartingScreen = ({ userList, onCountdownComplete }) => {
    const [countdown, setCountdown] = useState(5);

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

    return (
        <div className="hero center">
            <h2 id="message">Game is Starting in {countdown} seconds!</h2>
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