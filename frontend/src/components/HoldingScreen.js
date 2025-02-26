/*
    This holds all currently connected clients and allow them get ready for the game
*/

import React from 'react'; // Imports the React library
import { DotLottieReact } from '@lottiefiles/dotlottie-react'; // Imports the DotLottieReact component from the DotLottieReact library

// HoldingScreen component with a userList, onReady, and isReady prop
const HoldingScreen = ({ userList = [], onReady, isReady }) => {
    // Renders JSX visual elements
    return (
        <div className="hero center">
            <DotLottieReact
                src="https://lottie.host/fea002b1-c791-41fe-9bd7-35b205c3fd06/nbbCkk4Bha.lottie"
                loop
                autoplay
                style={{ width: 'var(--size-xlarge2)', height: 'var(--size-xlarge2)' }}
            />
            <br />
            <br />
            <h2>Game Lobby</h2>
            <br />
            <h3 style={{ width: '100%', overflowWrap: 'normal', whiteSpace: 'normal' }}>
                The game will start when there are at least 2 players and everyone is ready
            </h3>
            <br />
            {/* Calls the onReady function */}
            <button className="cta" onClick={onReady}>
                {isReady ? "Wait No I'm Not I'm Not" : "I'm Ready"}
            </button>
            <br />
            <br />
            <br />
            <div className="listBox">
                <h3>Players in the Game</h3>
                <br />
                <ul>
                    {userList.map((user, index) => (
                        <li key={index}>
                            {user.displayName} {user.ready ? "(Ready)" : "(Not Ready)"}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default HoldingScreen;