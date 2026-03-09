import { io } from "socket.io-client";

function getSocketUrl() {
    if (typeof window === "undefined") {
        return process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001";
    }

    // Allow override with environment variable (useful for tunnels)
    if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;

    const { protocol, hostname } = window.location;
    const port = 3001;

    // Use same scheme as the page (https -> https/wss, http -> http/ws)
    const scheme = protocol === "https:" ? "https:" : "http:";
    return `${scheme}//${hostname}:${port}`;
}

export const socket = io(getSocketUrl(), { autoConnect: false });