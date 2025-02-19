import React from 'react';

const GameStateInitial = ({ userList }) => {
    return (
        <div className="hero center">
            <div className="user-grid">
                {userList.filter(user => user.displayName).map(user => (
                    <div key={user.displayName} className="user-card">
                        {user.displayName}
                    </div>
                ))}
            </div>
            <br />
            <br />
            <br />
            <br />
            <div>
                <div className="prompt-card center">
                    <h2>Click to Reveal Your Prompt</h2>
                </div>
            </div>
        </div>
    );
};

export default GameStateInitial;