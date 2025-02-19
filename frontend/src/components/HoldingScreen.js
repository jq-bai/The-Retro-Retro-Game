import React from 'react';

const HoldingScreen = ({ message, userList = [], onReady, isReady }) => {
    return (
        <div className="hero center">
            <img 
                src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGZtbGc3OWI2Y21sYWU1bWU2d3B4M3plbGp6MXZwY293cGx1cnUzaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZR8teuiCs3AkSkzjnG/giphy.gif" 
                alt="Computer man" 
                style={{ maxWidth: 'auto', maxHeight: 'auto' }} 
            />
            <br />
            <br />
            <h2>{message}</h2>
            <br />
            <button className="cta" onClick={onReady}>
                {isReady ? "Wait No I'm Not" : "I'm Ready"}
            </button>
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