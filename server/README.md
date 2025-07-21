# Server Directory

This directory contains the backend implementation of the GamesProj application. It is built using the NestJS framework and provides various services and APIs for the application.

## Structure

- **src/**: Contains the main source code for the server.
  - **ai-validation/**: Handles AI-based validation logic using Google Generative AI.
    - `ai-validation.module.ts`: Defines the module for AI validation.
    - `ai-validation.service.ts`: Contains the logic for validating game data using AI.
  - **auth/**: Manages authentication and authorization.
    - `auth.controller.ts`: Handles authentication-related routes.
    - `auth.module.ts`: Defines the authentication module.
    - `auth.service.ts`: Contains the logic for user authentication.
    - `jwt-auth.guard.ts`: Protects routes using JWT authentication.
    - `jwt.strategy.ts`: Defines the strategy for validating JWT tokens.
    - **decorator/**: Contains custom decorators like `public.decorator.ts`.
  - **game/**: Contains game-related logic and services.
    - `game.controller.ts`: Handles game-related routes.
    - `game.gateway.ts`: Manages WebSocket connections for real-time game updates.
    - `game.module.ts`: Defines the game module.
    - `game.service.ts`: Contains the logic for game management.
    - **eratzIr/**: Handles specific game logic for "Eratz Ir".
      - `eratzIr.service.ts`: Contains the logic for "Eratz Ir" game.
    - **war/**: Handles specific game logic for "War".
      - `war.service.ts`: Contains the logic for "War" game.
  - **room/**: Manages room creation and updates.
    - `room.controller.ts`: Handles room-related routes.
    - `room.module.ts`: Defines the room module.
    - `room.service.ts`: Contains the logic for room management.
    - **dto/**: Contains Data Transfer Objects for room operations.
      - `create-room.dto.ts`: DTO for creating a room.
      - `update-room.dto.ts`: DTO for updating a room.
    - **entities/**: Contains database entities for rooms.
      - `room.entity.ts`: Defines the room entity.
  - **users/**: Handles user-related operations.
    - `users.controller.ts`: Handles user-related routes.
    - `users.module.ts`: Defines the user module.
    - `users.service.ts`: Contains the logic for user management.
    - **dto/**: Contains Data Transfer Objects for user operations.
      - `login.dto.ts`: DTO for user login.
      - `register.dto.ts`: DTO for user registration.
    - **entities/**: Contains database entities for users.
      - `user.entity.ts`: Defines the user entity.
  - `app.controller.ts`: Root controller for the application.
  - `app.module.ts`: Root module for the application.
  - `app.service.ts`: Root service for the application.
  - `main.ts`: Entry point for the application.

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

## Features

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

### AI Validation

The `ai-validation` module integrates Google Generative AI to validate game data. It ensures that player responses adhere to the rules of the game and provides detailed feedback on errors and validation results.

### Macro-Level Architecture

The server is designed with a modular architecture to ensure scalability and maintainability. Each feature is encapsulated within its own module, such as `auth`, `game`, `room`, and `users`. This separation of concerns allows for easier development and testing. The `app.module.ts` file serves as the root module, importing and organizing all other modules.

## License

This project is licensed under the MIT License.
