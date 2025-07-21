# Server Directory

This directory contains the backend implementation of the GamesProj application. It is built using the NestJS framework and provides various services and APIs for the application.

## Structure

- **src/**: Contains the main source code for the server.
  - **ai-validation/**: Handles AI-based validation logic.
  - **auth/**: Manages authentication and authorization.
  - **game/**: Contains game-related logic and services.
  - **room/**: Manages room creation and updates.
  - **users/**: Handles user-related operations.
  - **test/**: Contains end-to-end tests.

- **nest-cli.json**: Configuration file for NestJS CLI.
- **package.json**: Contains dependencies and scripts for the server.
- **tsconfig.json**: TypeScript configuration file.
- **tsconfig.build.json**: TypeScript configuration for building the project.

## Installation

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Server

1. Start the development server:
   ```bash
   npm run start:dev
   ```

2. For production:
   ```bash
   npm run start:prod
   ```

## Testing

Run the end-to-end tests:
```bash
npm run test:e2e
```

## Environment Variables

The server requires the following environment variables:

- `GEMINI_API_KEY`: API key for Google Generative AI.

## Features

- **AI Validation**: Validates game data using AI.
- **Authentication**: Provides JWT-based authentication.
- **Game Management**: Handles game logic and interactions.
- **Room Management**: Manages game rooms and lobbies.
- **User Management**: Handles user registration and login.

### WebSockets

The server uses WebSockets to enable real-time communication between the client and server. This is particularly useful for multiplayer games where updates need to be sent instantly to all connected players. The `game.gateway.ts` file handles WebSocket connections and events, ensuring smooth and efficient communication.

#### WebSocket Events

The following WebSocket events are implemented:

- **connection**: Triggered when a client connects to the server. Used to initialize the connection and set up necessary resources.
- **disconnect**: Triggered when a client disconnects. Used to clean up resources and notify other players.
- **joinRoom**: Allows a player to join a specific game room. The server validates the room ID and updates the room state.
- **leaveRoom**: Allows a player to leave a game room. The server updates the room state and notifies other players.
- **gameUpdate**: Sends updates about the game state to all players in the room. This includes player actions, scores, and other game-related data.
- **chatMessage**: Handles chat messages sent by players in the room. The server broadcasts the message to all players in the room.

### JWT Authentication

JWT (JSON Web Token) is used for secure authentication and authorization. The `auth` module manages the creation and validation of tokens, ensuring that only authenticated users can access protected routes and resources. The `jwt.strategy.ts` file defines the strategy for validating tokens, while the `jwt-auth.guard.ts` file protects specific routes.

### Macro-Level Architecture

The server is designed with a modular architecture to ensure scalability and maintainability. Each feature is encapsulated within its own module, such as `auth`, `game`, `room`, and `users`. This separation of concerns allows for easier development and testing. The `app.module.ts` file serves as the root module, importing and organizing all other modules.

## License

This project is licensed under the MIT License.
