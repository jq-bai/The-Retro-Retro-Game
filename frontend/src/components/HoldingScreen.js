import React from 'react';

const HoldingScreen = ({ message, userList = [], onReady }) => {
    return (
        <div className="hero center">
            <img 
                src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGZtbGc3OWI2Y21sYWU1bWU2d3B4M3plbGp6MXZwY293cGx1cnUzaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZR8teuiCs3AkSkzjnG/giphy.gif" 
                alt="Computer man" 
                style={{ maxWidth: '20em', maxHeight: '20em' }} 
            />
            <h2>{message}</h2>
            <p>Sit tight as we wait for more people to join and get ready!</p>
            <button className="cta" onClick={onReady}>I'm Ready</button>
            <div className="listBox">
                <h3>Players</h3>
                <ul>
                    {userList.map((user, index) => (
                        <li key={index}>{user.displayName}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default HoldingScreen;