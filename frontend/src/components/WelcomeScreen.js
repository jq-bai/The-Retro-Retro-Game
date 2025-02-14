import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const WelcomeScreen = ({ joinGame }) => {
    return (
        <div className="hero center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3>Welcome to the</h3>
            <h1>Retro Retro Game</h1>
            <br />
            <DotLottieReact
                src="https://lottie.host/a4c5d72a-3c2a-4d1a-9e3f-d2d955ff653f/IQdCcDyTiR.lottie"
                loop
                autoplay
            />
            <br />
            <button className="cta" onClick={joinGame}>Join a Game</button>
        </div>
    );
};

export default WelcomeScreen;