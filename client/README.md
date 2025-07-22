# Client Directory

This directory contains the frontend implementation of the GamesProj application. It is built using React and TypeScript, and utilizes Vite as the build tool.

## Structure

- **src/**: Contains the main source code for the client.
  - **api/**: Handles API calls using Axios.
  - **components/**: Contains reusable React components.
  - **pages/**: Contains page-level components for routing.
  - **App.tsx**: The main application component.
  - **main.tsx**: Entry point for the application.

- **index.html**: The main HTML file for the application.
- **vite.config.ts**: Configuration file for Vite.
- **tsconfig.json**: TypeScript configuration file.
- **package.json**: Contains dependencies and scripts for the client.

## Installation

1. Navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Client

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Build for production:
   ```bash
   npm run build
   ```

3. Preview the production build:
   ```bash
   npm run preview
   ```

## Features

- **Responsive Design**: Ensures the application works seamlessly across devices.
- **API Integration**: Communicates with the backend server for data.
- **Protected Routes**: Implements route protection using `ProtectedRoute.tsx`.
- **User Authentication**: Provides login and registration functionality.

## Environment Variables

The client requires the following environment variables:

- `VITE_API_URL`: Base URL for the backend API.