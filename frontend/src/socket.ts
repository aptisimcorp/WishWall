// src/socket.ts
import { io, Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;

// Remove /api if it exists
const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

console.log("🔗 Connecting to Socket:", SOCKET_URL);

const socket: Socket = io(SOCKET_URL, {
  transports: ["websocket"], // force WebSocket
  secure: SOCKET_URL.startsWith("https"),
});

export default socket;
