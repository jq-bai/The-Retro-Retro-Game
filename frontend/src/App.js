import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import WelcomeScreen from './components/WelcomeScreen';
import NameFormScreen from './components/NameFormScreen';
import HoldingScreen from './components/HoldingScreen';
import StartingScreen from './components/StartingScreen';
import GameStateInitial from './components/GameStateInitial';

function App() {
    const [currentScreen, setCurrentScreen] = useState('welcome');
    const [playerName, setPlayerName] = useState('');
    const [isReady, setIsReady] = useState(false);
    const [userList, setUserList] = useState([]);
    const eventSourceRef = useRef(null);

    const joinGame = () => {
        setCurrentScreen('nameForm');
    };

    const submitName = (name) => {
        axios.post('/submit-name', { displayName: name })
            .then(response => {
                setPlayerName(name);
                setUserList(response.data.users);
                setCurrentScreen('holding');

                // Set up SSE connection after user has entered their display name
                if (!eventSourceRef.current) {
                    const newEventSource = new EventSource(`/events?displayName=${name}`);
                    newEventSource.onmessage = (event) => {
                        const data = JSON.parse(event.data);
                        if (data.type === 'userList') {
                            setUserList(data.users);
                        } else if (data.type === 'startGame') {
                            setCurrentScreen('starting');
                        }
                    };
                    newEventSource.onerror = (error) => {
                        console.error("EventSource failed:", error);
                        newEventSource.close();
                        eventSourceRef.current = null;
                    };
                    eventSourceRef.current = newEventSource;
                }
            })
            .catch(error => {
                console.error('Error submitting name:', error);
            });
    };

    const setReady = () => {
        axios.post('/set-ready', { displayName: playerName })
            .then(response => {
                setIsReady(prevIsReady => !prevIsReady);
            })
            .catch(error => {
                console.error('Error setting ready status:', error);
            });
    };

    useEffect(() => {
        // Clean up the EventSource connection when the component unmounts
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    return (
        <div>
            {currentScreen === 'welcome' && <WelcomeScreen joinGame={joinGame} />}
            {currentScreen === 'nameForm' && <NameFormScreen onSubmit={submitName} />}
            {currentScreen === 'holding' && <HoldingScreen message="Waiting for players..." userList={userList} onReady={setReady} isReady={isReady} />}
            {currentScreen === 'starting' && <StartingScreen userList={userList} onCountdownComplete={() => setCurrentScreen('gameState')} />}
            {currentScreen === 'gameState' && <GameStateInitial userList={userList} displayName={playerName} eventSource={eventSourceRef.current} />}
        </div>
    );
}

export default App;