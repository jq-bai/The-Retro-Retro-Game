# The Retro Retro Game

<div id="lottie-animation" style="width: 200px; height: 200px;"></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.7.6/lottie.min.js"></script>
<script>
    var animation = lottie.loadAnimation({
        container: document.getElementById('lottie-animation'), // the DOM element that will contain the animation
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://lottie.host/be15b006-9c70-427a-b438-2ff303d51a7f/Osti3Ta6ZB.lottie' // the path to the animation JSON
    });
</script>

## Overview
A retro-feeling retro(spective) game that makes it easier for teams to bond, be it in person or online.

## Project Structure
The-Retro-Retro-Game/
├── backend/
│   └── server.js
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── assets/
│   │       └── favicon.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── WelcomeScreen.js
│   │   │   ├── NameFormScreen.js
│   │   │   ├── HoldingScreen.js
│   │   │   ├── StartingScreen.js
│   │   │   ├── GameStateInitial.js
│   │   │   └── GameStateEnd.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── main.css
│   ├── package.json
│   └── package-lock.json
├── .gitignore
├── .babelrc
├── webpack.config.js
├── package.json
├── package-lock.json
└── README.md

## License
This project is licensed under the Apache 2.0 License. See the LICENSE file for details.