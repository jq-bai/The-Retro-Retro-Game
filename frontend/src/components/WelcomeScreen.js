/*
    This the landing state of the app
*/

import React from 'react'; // Imports the React library
import { DotLottieReact } from '@lottiefiles/dotlottie-react'; // Imports the DotLottieReact component from the DotLottieReact library

// WelcomeScreen component with a joinGame prop
const WelcomeScreen = ({ joinGame }) => {
    return (

        // Renders JSX visual elements
        <div className="hero center">
            <h3>Welcome to the</h3>
            <h1>Retro Retro Game</h1>
            <br />
            <DotLottieReact
                src="https://lottie.host/be15b006-9c70-427a-b438-2ff303d51a7f/Osti3Ta6ZB.lottie"
                loop
                autoplay
                style={{ width: 'var(--size-xlarge3)', height: 'var(--size-xlarge3)' }}
            />
            <br />

            {/* Calls the joinGame function */}
            <button className="cta" onClick={joinGame}>Join a Game</button>
        </div>
    );
};

export default WelcomeScreen;