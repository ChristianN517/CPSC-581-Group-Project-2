import { io } from "socket.io-client";

const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const socketUrl = isLocalhost 
    ? `http://192.168.1.95:3001`
    : 'https://bricks-9y9l.onrender.com';

export const socket = io(socketUrl, {
    autoConnect: false,
});
