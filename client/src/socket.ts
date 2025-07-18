import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = (): Socket => {
  if (!socket) {
    socket = io("http://localhost:3000", {
      auth: { token: localStorage.getItem("token") },
      transports: ["websocket"],
    });

    socket.on("connect", () => console.log("✅ Connected to WebSocket"));
    socket.on("disconnect", () => console.log("❌ Disconnected from WebSocket"));
  }
  return socket;
};

export const getSocket = (): Socket => {
  if (!socket) throw new Error("Socket not initialized. Call initSocket() first.");
  return socket;
};
