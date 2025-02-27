/*
    This is the main React component for the app
    This manages the flow of the game, handles user inputs, and communicates and synchronizes the interactions and states between the clients and server
*/

import React, { useState, useEffect, useRef } from 'react'; // Imports the useState, useEffect, and useRef hooks from React
import axios from 'axios'; // Imports the Axios library for making HTTP requests

// React components
import WelcomeScreen from './components/WelcomeScreen'; // Imports the WelcomeScreen component which is the landing state of the app
import NameFormScreen from './components/NameFormScreen'; // Imports the NameFormScreen component for a client to enter their name to initiate joining a game
import HoldingScreen from './components/HoldingScreen'; // Imports the HoldingScreen component which holds all currently connected clients and allow them get ready for the game
import StartingScreen from './components/StartingScreen'; // Imports the StartingScreen component which initiates the countdown to start the game once all clients are ready
import GameStateInitial from './components/GameStateInitial'; // Imports the GameStateInitial component which is the main game state
import GameStateEnd from './components/GameStateEnd'; // Imports the GameStateEnd component which is the end game state

// Main App component
function App() {
    // State variables
    const [currentScreen, setCurrentScreen] = useState('welcome'); // Tracks the current screen state, defaults to the welcome screen
    const [playerName, setPlayerName] = useState(''); // Tracks the client's name
    const [isReady, setIsReady] = useState(false); // Tracks the client's ready status
    const [userList, setUserList] = useState([]); // Tracks the list of all connected clients
    const [scores, setScores] = useState({}); // Tracks the scores of all connected clients
    const [winner, setWinner] = useState(null); // Tracks the winner of the game
    const [lastActionMessage, setLastActionMessage] = useState(''); // Tracks the last action message
    const eventSourceRef = useRef(null); // Reference for the EventSource connection

    // Function to join the game
    // From WelcomeScreen.js
    const joinGame = () => {
        setCurrentScreen('nameForm');
        console.log('Attempting to join a game');
    };

    // Function to submit the client's name and sets up an SSE connection
    // From NameFormScreen.js
    const submitName = (name) => {
        axios.post('/submit-name', { displayName: name })
            .then(response => {
                // Record client's name and transits to next screen
                setPlayerName(name);
                setUserList(response.data.users);
                setCurrentScreen('holding');
                console.log('Submitting name:', name);

                // Sets up an SSE connection between the server and the current client
                if (!eventSourceRef.current) {
                    const newEventSource = new EventSource(`/events?displayName=${name}`);
                    newEventSource.onmessage = (event) => {
                        const data = JSON.parse(event.data);

                        // Handling different types of events from the server
                        if (data.type === 'userList') {
                            setUserList(data.users);
                        } else if (data.type === 'startGame') {
                            setCurrentScreen('starting');
                        } else if (data.type === 'scoreUpdate') {
                            setScores(data.scores);
                        } else if (data.type === 'gameEnd') {
                            setWinner(data.winner);
                            setCurrentScreen('gameStateEnd');
                        } else if (data.type === 'reset') {
                            handleReturnToTitle();
                        } else if (data.type === 'lastAction') {
                            setLastActionMessage(data.message);
                        }
                    };

                    // Error handling for the EventSource connection
                    newEventSource.onerror = (error) => {
                        console.error("EventSource failed:", error);
                        newEventSource.close();
                        eventSourceRef.current = null; // Reset the eventSourceRef
                    };

                    eventSourceRef.current = newEventSource;
                    console.log('EventSource connection established');
                }
            })

            // Error handling for the name submission
            .catch(error => {
                console.error('Error submitting name:', error);
            });
    };

    // Function to toggle the client's ready status
    // From HoldingScreen.js
    const setReady = () => {
        axios.post('/set-ready', { displayName: playerName })
            .then(response => {
                setIsReady(prevIsReady => !prevIsReady);
                console.log('Setting ready:', !isReady);
            })

            // Error handling for setting the ready status
            .catch(error => {
                console.error('Error setting ready status:', error);
            });
    };

    // Function to return to the title screen after a game has ended
    // From GameStateEnd.js
    const handleReturnToTitle = () => {
        axios.post('/clear-data')
            .then(response => {
                console.log('Server response:', response.data); // Logs the server response

                // Clears all data and resets the game state
                setPlayerName('');
                setIsReady(false);
                setUserList([]);
                setScores({});
                setWinner(null);
                setCurrentScreen('welcome');

                // Closes the EventSource connection
                if (eventSourceRef.current) {
                    eventSourceRef.current.close();
                    eventSourceRef.current = null;
                }
            })

            // Error handling for returning to the title screen
            .catch(error => {
                console.error('Error returning to title screen:', error);
            });
    };

    // useEffect hook to clean up the EventSource connection when the component unmounts
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    // Main render function
    return (
        <div>
            {currentScreen === 'welcome' && <WelcomeScreen joinGame={joinGame} />} {/* Renders the WelcomeScreen component */}
            {currentScreen === 'nameForm' && <NameFormScreen onSubmit={submitName} />} {/* Renders the NameFormScreen component */}
            {currentScreen === 'holding' && <HoldingScreen userList={userList} onReady={setReady} isReady={isReady} />} {/* Renders the HoldingScreen component */}
            {currentScreen === 'starting' && <StartingScreen userList={userList} onCountdownComplete={() => setCurrentScreen('gameState')} />} {/* Renders the StartingScreen component */}
            {currentScreen === 'gameState' && <GameStateInitial userList={userList} displayName={playerName} eventSource={eventSourceRef.current} setCurrentScreen={setCurrentScreen} setWinner={setWinner} lastActionMessage={lastActionMessage} setLastActionMessage={setLastActionMessage} />} {/* Renders the GameStateInitial component */}
            {currentScreen === 'gameStateEnd' && <GameStateEnd winner={winner} onReturnToTitle={handleReturnToTitle} />} {/* Renders the GameStateEnd component */}
        </div>
    );
}

export default App;