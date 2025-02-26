/*
    This initializes the React app by rendering the main App component to the root element in index.html
*/

import React from 'react'; // Imports the React Library for creating React components
import ReactDOM from 'react-dom/client'; // Imports the ReactDOM Library for rendering React components to the DOM
import App from './App'; // Imports the main React App component
import './main.css'; // Imports the main CSS file for the app

const root = ReactDOM.createRoot(document.getElementById('root')); // Creates a root for the React app by selecting the root element from the DOM in index.html

// Renders the React app to the root element
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);