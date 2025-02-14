import React, { useState } from 'react';

const NameFormScreen = ({ onSubmit }) => {
    const [displayName, setDisplayName] = useState('');

    const handleChange = (event) => {
        setDisplayName(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (displayName) {
            onSubmit(displayName);
        }
    };

    return (
        <div className="hero center">
            <h2>Enter your Name</h2>
            <form onSubmit={handleSubmit}>
                <input
                    className="textfield"
                    type="text"
                    value={displayName}
                    onChange={handleChange}
                    placeholder="Hmmm.."
                />
                <br />
                <button className="cta" type="submit">Next</button>
            </form>
        </div>
    );
};

export default NameFormScreen;