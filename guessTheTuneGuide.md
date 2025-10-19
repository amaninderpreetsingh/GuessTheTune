### **Project Description for External Partners (e.g., Lovable)**

GuessTheTune is a real-time, social music trivia game designed to bring friends together through the power of their shared favorite songs. The application integrates directly with Spotify, allowing a "host" to select one of their personal playlists to power the game. Once the game starts, a song is played for all participants in a private room. The core of the experience is a thrilling "fastest-finger-first" mechanic where players race to be the first to buzz in by clicking the "I Know It\!" button. The first player to buzz in gets 30 seconds to guess the song's title. A rotating "judge" from the group confirms if the guess is correct. Correct guesses earn points, and the first player to reach 10 points is crowned the GuessTheTune champion. The entire experience is wrapped in a sleek, modern, and intuitive user interface with a dark-mode aesthetic, designed to feel like a fun, engaging social event for any group of music lovers.

### **Detailed Plan for Claude AI Agent**

**Objective:** To build a full-stack, real-time, multiplayer "Guess the Song" web application called GuessTheTune using React, Node.js, and Socket.io, with deep integration of the Spotify API.

**Core Principles for Development:**

* **Production-Ready Code:** All code, both front-end and back-end, must be clean, robust, and well-documented. Follow all modern best practices for security, performance, and scalability.  
* **Modular Architecture:** Utilize small, single-responsibility functions and files. The React front-end should be built with reusable components.  
* **Aesthetics & UI/UX:** The website must have a modern, aesthetically pleasing design. The UI should be intuitive and responsive, providing a seamless experience on both desktop and mobile.  
  * **Color Palette:** A consistent, modern, dark-mode color palette should be used.  
    * Primary Background: \#121212 (Very Dark Grey)  
    * Secondary Background/Cards: \#1E1E1E (Dark Grey)  
    * Primary Accent (Buttons, Highlights): \#1DB954 (Spotify Green)  
    * Primary Text: \#FFFFFF (White)  
    * Secondary Text: \#B3B3B3 (Light Grey)  
  * **Styling:** Use **Tailwind CSS** for all styling to ensure consistency, responsiveness, and maintainability.  
* **Project Structure:** The project will be a monorepo with the front-end and back-end in separate subdirectories to facilitate simultaneous development, even though they will be hosted separately.  
  /guessTheTune/  
  ├── client/         \# React Frontend  
  │   ├── public/  
  │   └── src/  
  │       ├── components/  
  │       ├── pages/  
  │       ├── hooks/  
  │       ├── styles/  
  │       └── App.js  
  └── server/         \# Node.js \+ Express \+ Socket.io Backend  
      ├── controllers/  
      ├── services/  
      └── index.js

### **Technical Deep Dive: How Spotify Integration Works**

A core part of this application is the interaction with Spotify. This involves two main parts: server-side authentication/data fetching, and client-side music playback.

1. **Server-Side: Spotify Web API & Authentication**  
   * **Authentication Flow (OAuth 2.0 \- Authorization Code Flow):** This is the most secure method and is mandatory.  
     1. **User Initiates Login:** The user (the future Host) clicks a "Login with Spotify" button in our React app.  
     2. **Redirect to Spotify:** Our server constructs a special URL and redirects the user to the Spotify Accounts service. This URL includes our client\_id and the scopes (permissions) we need, such as streaming, user-read-email, user-read-private, playlist-read-private.  
     3. **User Grants Permission:** The user logs into Spotify and agrees to grant our app the requested permissions.  
     4. **Redirect Back with Code:** Spotify redirects the user back to a specified /callback URI on our server, including a temporary authorization\_code.  
     5. **Server Exchanges Code for Tokens:** Our Node.js server takes this code, combines it with our secret client\_secret, and makes a secure, server-to-server POST request to Spotify to exchange the code for an access\_token and a refresh\_token.  
     6. **Secure Storage:** The access\_token (lasts 1 hour) and the permanent refresh\_token are securely stored (e.g., in a secure, httpOnly cookie or associated with a user session) for the Host. The client\_secret **must never** be exposed to the front-end.  
   * **Using the API:** The server will use the access\_token to make calls to the Spotify Web API on behalf of the Host to fetch their playlists and the tracks within those playlists.  
2. **Client-Side (HOST ONLY): Spotify Web Playback SDK**  
   * **What It Is:** This is a JavaScript library that allows our web app to act as a Spotify Connect device *in the browser*. It can stream and control audio directly.  
   * **Requirement:** The user (Host) **must have a Spotify Premium account** for the SDK to work.  
   * **How it Works:**  
     1. **Initialization:** After the Host is authenticated, the React app will load the SDK script. We then initialize a Spotify.Player object, passing it the access\_token obtained during authentication.  
     2. **Device ID:** Upon successful initialization, the SDK provides a unique device\_id. This identifies the browser tab as a valid playback target. The Host's client needs to tell the Spotify API to transfer playback to this device\_id.  
     3. **Controlling Playback:** The Host's client can use SDK methods like player.togglePlay(), player.nextTrack(), player.pause(), and player.seek().  
     4. **Listening to State:** The SDK emits a player\_state\_changed event, which gives us real-time information about the current track, its progress, and whether it's paused or playing. This is crucial for syncing the game state.  
   * **Crucial Architectural Point:** Only the **Host** will initialize and use the Web Playback SDK. All other players in the room are "thin clients"; they only see UI updates broadcast by our server and do not play audio.

### **Development Plan: Step-by-Step Checkpoints**

#### **Checkpoint 0: Project Setup & Boilerplate**

* **Goal:** Initialize the monorepo, the React client, and the Node.js server.  
* **client/ Tasks:**  
  * Use create-react-app to set up a new React project.  
  * Install necessary libraries: socket.io-client, react-router-dom, axios, tailwindcss.  
  * Configure Tailwind CSS.  
  * Create the basic file structure (components, pages, etc.).  
* **server/ Tasks:**  
  * Initialize a Node.js project (npm init).  
  * Install necessary libraries: express, socket.io, cors, axios, dotenv, cookie-parser.  
  * Set up a basic Express server in index.js that listens on a port (e.g., 8080).  
  * Set up a basic Socket.io server instance attached to the Express server.

#### **Checkpoint 1: Spotify Authentication Flow**

* **Goal:** Implement the complete and secure Spotify OAuth 2.0 Authorization Code Flow.  
* **server/ Tasks:**  
  * Create .env file for SPOTIFY\_CLIENT\_ID, SPOTIFY\_CLIENT\_SECRET, and REDIRECT\_URI.  
  * Create an authController.js.  
  * Create a /login endpoint that redirects the user to the Spotify authorization page with the correct scopes.  
  * Create a /callback endpoint that:  
    1. Receives the code from Spotify.  
    2. Exchanges the code for an access\_token and refresh\_token.  
    3. Securely stores the tokens (e.g., in an httpOnly cookie).  
    4. Redirects the user back to the React front-end (e.g., to a /lobby page).  
  * Create a /refresh\_token endpoint that uses the refresh\_token to get a new access\_token.  
* **client/ Tasks:**  
  * Create a HomePage.js page component.  
  * Add a "Login with Spotify" button that links to http://\<your-backend-url\>/login.  
  * Set up a global state management solution (React Context or Zustand) to hold authentication status and user info.

#### **Checkpoint 2: Game Room & Lobby Logic (Backend)**

* **Goal:** Implement the server-side logic for creating, joining, and managing game rooms in memory.  
* **server/ Tasks:**  
  * Create a gameManager.js service. This will hold the entire game state in a JavaScript object/Map in memory.  
    * const rooms \= new Map();  
    * The room object should look like: { id: 'ABCD', players: \[\], gameState: 'lobby', hostId: 'socket.id', ... }  
  * In your main socket.io connection logic:  
    * Listen for a createRoom event. When received, generate a unique 4-letter room code, create a new room object in the gameManager, add the player, have the socket join the Socket.io room, and emit a roomCreated event back to the creator with the room details.  
    * Listen for a joinRoom event with a roomCode. Validate the code. If valid, add the player to the room object, have the socket join the Socket.io room, and broadcast a playerJoined event to everyone *in that room* with the updated player list.  
    * Handle disconnect events to remove players from rooms and notify others.

#### **Checkpoint 3: Frontend UI for Creating & Joining Rooms**

* **Goal:** Build the React components for the user to create or join a game.  
* **client/ Tasks:**  
  * Create a LobbyPage.js. After successful login, the user lands here.  
  * On this page, display two options: "Create a Room" and "Join a Room" (with a text input for the code).  
  * **Create Flow:**  
    * Button click emits createRoom via socket.  
    * Listen for roomCreated event from the server. Upon receiving, use react-router-dom to navigate the user to /room/:roomCode.  
  * **Join Flow:**  
    * Form submission emits joinRoom with the code.  
    * Listen for playerJoined and server-side validation events. On success, navigate to /room/:roomCode.  
  * Create a GameRoomPage.js component. This will be the main view for the game.  
  * In GameRoomPage.js, display a list of players in the room. This list should update in real-time by listening to playerJoined and playerLeft events.

#### **Checkpoint 4: Host Experience \- Playlist & Playback**

* **Goal:** Allow the Host to fetch their playlists and start the game, controlling music via the Web Playback SDK.  
* **server/ Tasks:**  
  * Create a /playlists endpoint that uses the Host's stored access\_token to fetch their Spotify playlists.  
  * Create a /playlist-tracks/:playlistId endpoint to get all tracks for a selected playlist.  
* **client/ Tasks (in GameRoomPage.js):**  
  * **Conditional UI:** If the current user is the Host, show a "Select Playlist" UI. Fetch playlists from the server's /playlists endpoint.  
  * Once a playlist is selected, fetch its tracks. Show a "Start Game" button.  
  * **Playback SDK Integration:**  
    1. On component mount (for the Host only), initialize the Spotify Web Playback SDK. Store the device\_id.  
    2. On "Start Game" click:  
       * Shuffle the fetched track list.  
       * Tell the server to start playback on the Host's device\_id for the first track in the shuffled list. (This can be an API call or a socket event).  
       * Emit a gameStarted event to the server.  
  * The server broadcasts gameStarted to all players in the room. The UI for everyone changes from a lobby view to the main game view.

#### **Checkpoint 5: The Core Gameplay Loop**

* **Goal:** Implement the "I Know It\!" button, buzz-in logic, and human judging.  
* **server/ Tasks (in socket.io logic):**  
  * Listen for a buzzIn event.  
  * **Crucial Logic:** Inside the gameManager, for that room, have a flag like isGuessingActive.  
  * When a buzzIn event is received, check if isGuessingActive is false.  
    * If false: Set it to true. Store the socket.id of the buzzer. Start a 30-second server-side timer. Broadcast a playerIsGuessing event to the entire room with the buzzer's info.  
    * If true: Do nothing. The server ignores the buzz.  
  * If the 30-second timer expires, reset isGuessingActive to false and broadcast a guessTimeExpired event, telling the Host to resume playback.  
  * Listen for a submitJudgment event from the judge, containing { guesserId, isCorrect }. Update scores, reset isGuessingActive, and broadcast a roundOver event with the result and new scores.  
* **client/ Tasks (in GameRoomPage.js):**  
  * Show a large "I Know It\!" button to all non-host, non-judging players. On click, it emits buzzIn.  
  * Listen for playerIsGuessing.  
    * When received, disable the "I Know It\!" button for everyone.  
    * The Host's client uses player.pause() on the SDK.  
    * The UI shows "Player X is guessing..."  
    * The designated Judge's UI shows "Correct" and "Incorrect" buttons. On click, these emit submitJudgment.  
  * Listen for roundOver. Update the scoreboard. If the guess was incorrect, the Host's client calls player.togglePlay(). If correct, the Host moves to the next song.  
  * Listen for guessTimeExpired. The Host's client calls player.togglePlay().

#### **Checkpoint 6: Scoring, Winning, and Game Over**

* **Goal:** Finalize the game loop by tracking scores and declaring a winner.  
* **server/ Tasks:**  
  * After a correct judgment in submitJudgment, check the guesser's new score. If it's 10 (or the winning score), broadcast a gameOver event with the winner's name instead of roundOver.  
* **client/ Tasks:**  
  * Create a scoreboard component that updates on the roundOver event.  
  * Listen for the gameOver event. When received, display a "Winner\!" modal or screen with a "Play Again" button.

#### **Checkpoint 7: Polishing and Final Touches**

* **Goal:** Add animations, loading states, and error handling to make the app feel professional.  
* **Tasks:**  
  * Add loading spinners for fetching playlists and tracks.  
  * Use a library like framer-motion for smooth page transitions and UI animations.  
  * Implement robust error handling for API calls and socket connection issues, showing user-friendly messages.  
  * Ensure the entire application is fully responsive and looks great on mobile devices.

### **Future Plans: AI-Powered Judging (Post-MVP)**

Once the core game with a human judge is fully functional, we will add the AI judging feature.

1. **Audio Capture on Client:** The guessing player's client will use the browser's MediaRecorder API to capture their spoken guess.  
2. **New API Endpoint:** Create a new endpoint on the server (e.g., POST /api/guess) that accepts audio data.  
3. **Server-Side AI Orchestration:**  
   * The server receives the audio file.  
   * It sends the audio to a speech-to-text API (e.g., OpenAI Whisper).  
   * It takes the transcribed text and compares it to the correct song title using a fuzzy string matching algorithm (to account for minor mispronunciations) or another LLM call for semantic comparison.  
4. **Broadcast Result:** The server determines if the guess is correct and then broadcasts the roundOver or gameOver event via Socket.io, just as the human judge would have.