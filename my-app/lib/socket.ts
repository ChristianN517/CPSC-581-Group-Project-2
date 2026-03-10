import { io } from "socket.io-client";

// https://bricks-9y9l.onrender.com
const host = typeof window !== 'undefined'
    ? (window.location.hostname === 'localhost' ? '192.168.1.95' : window.location.hostname)
    : '192.168.1.95';

export const socket = io(`http://${host}:3001`, {
    autoConnect: false,
});
