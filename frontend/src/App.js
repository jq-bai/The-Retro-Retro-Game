import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WelcomeScreen from './components/WelcomeScreen';
import NameFormScreen from './components/NameFormScreen';
import HoldingScreen from './components/HoldingScreen';
import StartingScreen from './components/StartingScreen';
import GameState from './components/GameState';

function App() {
    const [currentScreen, setCurrentScreen] = useState('welcome');
    const [playerName, setPlayerName] = useState('');
    const [isReady, setIsReady] = useState(false);
    const [userList, setUserList] = useState([]);

    useEffect(() => {
        // Fetch the initial list of users from the server
        axios.get('/api/users')
            .then(response => {
                setUserList(response.data);
            })
            .catch(error => {
                console.error('Error fetching user list:', error);
            });

        // Set up SSE connection
        const eventSource = new EventSource('/events');
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'userList') {
                setUserList(data.users);
            }
        };

        return () => {
            eventSource.close();
        };
    }, []);

    const joinGame = () => {
        setCurrentScreen('nameForm');
    };

    const submitName = (name) => {
        axios.post('/submit-name', { displayName: name })
            .then(response => {
                setPlayerName(name);
                setUserList(response.data.users);
                setCurrentScreen('holding');
            })
            .catch(error => {
                console.error('Error submitting name:', error);
            });
    };

    const setReady = () => {
        axios.post('/set-ready', { displayName: playerName })
            .then(response => {
                setIsReady(true);
                setCurrentScreen('starting');
            })
            .catch(error => {
                console.error('Error setting ready status:', error);
            });
    };

    return (
        <div>
            {currentScreen === 'welcome' && <WelcomeScreen joinGame={joinGame} />}
            {currentScreen === 'nameForm' && <NameFormScreen onSubmit={submitName} />}
            {currentScreen === 'holding' && <HoldingScreen message="Waiting for players..." userList={userList} onReady={setReady} />}
            {currentScreen === 'starting' && <StartingScreen />}
            {isReady && <GameState />}
        </div>
    );
}

export default App;