/*
    This is the end game state
*/

import React from 'react'; // Imports the React library
import { DotLottieReact } from '@lottiefiles/dotlottie-react'; // Imports the DotLottieReact component from the DotLottieReact library

// GameStateEnd component with a winner and onReturnToTitle prop
const GameStateEnd = ({ winner, onReturnToTitle }) => {
    // Renders JSX visual elements
    return (
        <div className="hero center">
            <DotLottieReact
                src="https://lottie.host/be15b006-9c70-427a-b438-2ff303d51a7f/Osti3Ta6ZB.lottie"
                loop
                autoplay
                style={{ width: 'var(--size-xlarge2)', height: 'var(--size-xlarge2)' }}
            />
            <br />
            <br />
            <h2>Game Over</h2>
            <h3>The winner is {winner}</h3> {/* Display the winner */}
            <br />

            {/* Calls the onReturnToTile function */}
            <button className="cta" onClick={onReturnToTitle}>Return to Title Screen</button> {/* Return to Title Screen button */}
        </div>
    );
};

export default GameStateEnd;