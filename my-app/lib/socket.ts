import { io } from "socket.io-client";

// http://localhost:3001
export const socket = io("https://bricks-9y9l.onrender.com", {
    autoConnect: false,
});