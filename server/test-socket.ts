
const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", {
    auth: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Inlvc2VmMTExMSIsInN1YiI6IjFlZDMwMmMyLTRmNTYtNDI5ZS04YTYxLWM5MGMzMDFjODE1OSIsImlhdCI6MTc1MzAxMTA0NSwiZXhwIjoxNzUzMDE0NjQ1fQ.F5AUyaVF1F8oAx2ShODrY-sye0NNjRSXkdytwOrdJQQ" }
});

socket.on("connect", () => {
    console.log("✅ Connected to server");
    socket.emit("joinRoom", { roomId: "room1" });
});

socket.on("roomUpdate", (data) => {
    console.log("📢 Room Update:", data);
});

socket.on("gameStateUpdate", (data) => {
    console.log("🎮 Game State:", data);
});

socket.on("connect_error", (err) => {
    console.error("❌ Connection Error:", err.message);
});