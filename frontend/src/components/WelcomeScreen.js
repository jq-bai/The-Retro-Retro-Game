import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const WelcomeScreen = ({ joinGame }) => {
    return (
        <div className="hero center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3>Welcome to the</h3>
            <h1>Retro Retro Game</h1>
            <br />
            <DotLottieReact
                src="https://lottie.host/be15b006-9c70-427a-b438-2ff303d51a7f/Osti3Ta6ZB.lottie"
                loop
                autoplay
            />
            <br />
            <button className="cta" onClick={joinGame}>Join a Game</button>
        </div>
    );
};

export default WelcomeScreen;