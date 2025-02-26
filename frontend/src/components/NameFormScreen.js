/*
    This is for a client to enter their name to initiate joining a game
*/

import React, { useState, useRef, useEffect } from 'react'; // Imports the useState, useRef, and useEffect hooks from React
import axios from 'axios'; // Imports the Axios library for making HTTP requests

// NameFormScreen component with an onSubmit prop
const NameFormScreen = ({ onSubmit }) => {
    const [displayName, setDisplayName] = useState(''); // State variable to track the display name
    const inputRef = useRef(null); // Create a reference for the input element

    // Function to update the display name
    const handleChange = (event) => {
        setDisplayName(event.target.value);
    };

    // Function to check if the entered display name already exists
    const checkNameExists = async (name) => {
        try {
            const response = await axios.post('/check-name', { displayName: name });
            return response.data.exists;
        } 
        
        // Error handling for checking name
        catch (error) {
            console.error('Error checking name:', error);
            return false;
        }
    };

    // Function to send the display name to the server
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (displayName) {
            const nameExists = await checkNameExists(displayName);
            if (nameExists) {
                alert("Don't copy others leh, use a different name");
            } else {
                onSubmit(displayName);
            }
        } else {
            alert("You don't anyhow ah, enter your name first");
        }
    };

    // useEffect hook to focus on the textfield when the component mounts
    useEffect(() => {
        inputRef.current.focus();
    }, []);

    // Renders JSX visual elements
    return (
        <div className="hero center">
            <h2>Enter your Name</h2>
            <br />
            <form className="form-container" onSubmit={handleSubmit}>
                <input
                    className="textfield"
                    type="text"
                    value={displayName}
                    onChange={handleChange}
                    placeholder="Hmmm.."
                    ref={inputRef}
                />
                <br />
                <br />
                
                {/* Calls the handleSubmit function */}
                <button className="cta" type="submit">Next</button>
            </form>
        </div>
    );
};

export default NameFormScreen;