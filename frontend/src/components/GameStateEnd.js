import React from 'react';

const GameStateEnd = ({ winner, onReturnToTitle }) => {

    return (
        <div className="hero center">
            <h2>Game Over</h2>
            <h3>The winner is {winner}</h3> {/* Display the winner */}
            <br />
            <button className="cta" onClick={onReturnToTitle}>Return to Title Screen</button> {/* Return to Title Screen button */}
        </div>
    );
};

export default GameStateEnd;