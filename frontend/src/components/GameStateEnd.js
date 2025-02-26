import React from 'react';

const GameStateEnd = ({ scores, winner }) => {
    return (
        <div>
            <h2>Game Over</h2>
            <h3>Winner: {winner}</h3> {/* Display the winner */}
            <div>
                <h3>Scores:</h3>
                <ul>
                    {Object.entries(scores).map(([player, score]) => (
                        <li key={player}>{player}: {score}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default GameStateEnd;