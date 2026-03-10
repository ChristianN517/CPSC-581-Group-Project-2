"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { socket } from "@/lib/socket";

type Status = "connecting" | "linked" | "error";

export default function MobileProxy() {
    const searchParams = useSearchParams();
    const code = searchParams.get("code");
    const studentId = searchParams.get("studentId");
    const [status, setStatus] = useState<Status>("connecting");
    const [hapticCount, setHapticCount] = useState(0);
    const [userActivated, setUserActivated] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    function addLog(msg: string) {
        setLogs(prev => [...prev.slice(-19), msg]); // keep last 20 logs
    }

    useEffect(() => {
        if (!code || !studentId) {
            setStatus("error");
            return;
        }

        addLog(`Vibrate supported: ${!!navigator.vibrate}`);
        socket.connect();

        socket.on("connect", () => {
            addLog("Connected to server");
            // Register this phone as the haptic proxy for the student
            socket.emit(
                "proxy:register",
                { code, studentSocketId: studentId },
                () => {
                    addLog("Proxy registered successfully");
                    setStatus("linked");
                    // Notify desktop that phone is linked
                    socket.emit("proxy:linked");
                    // Confirmation buzz on link
                    const result = navigator.vibrate?.([80, 40, 80]);
                    addLog(`Link confirmation vibrate result: ${result}`);
                }
            );
        });

        // Listen for haptic events from server
        socket.on("haptic:fire", ({ pattern }) => {
            addLog(`haptic:fire received — pattern: ${JSON.stringify(pattern)}`);
            const result = navigator.vibrate?.(pattern);
            addLog(`vibrate result: ${result}`);
            setHapticCount(prev => prev + 1);
        });

        socket.on("session:ended", () => {
            setStatus("error");
            socket.disconnect();
        });

        return () => {
            socket.off("connect");
            socket.off("haptic:fire");
            socket.off("session:ended");
            socket.disconnect();
        };
    }, [code, studentId]);

    // Render
    if (status === "error") {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-8 text-center">
                <p className="text-red-400 text-xl font-bold">Session not found</p>
                <p className="text-gray-500 text-sm mt-2">Ask your instructor for a new QR code</p>
            </div>
        );
    }

    if (status === "connecting") {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-8 text-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-300 text-lg">Linking to workspace...</p>
            </div>
        );
    }

    if (status === "linked" && !userActivated) {
        return (
            <div
                className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-8 text-center gap-6 cursor-pointer"
                onClick={() => {
                    const result = navigator.vibrate?.([80, 40, 80]);
                    addLog(`Activation vibrate result: ${result}`);
                    setUserActivated(true);
                }}
            >
                <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />
                <p className="text-white text-4xl font-bold">Tap to activate</p>
                <p className="text-gray-400 text-sm mt-2">
                    Required to enable haptic feedback
                </p>
                <div className="mt-8 space-y-1">
                    {logs.map((log, i) => (
                        <p key={i} className="text-yellow-400 font-mono text-xs">{log}</p>
                    ))}
                </div>
            </div>

        );
    }

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-8 text-center gap-10">

            {/* Status indicator */}
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-400 font-mono text-sm">Linked to Workspace</span>
            </div>

            {/* Main instruction */}
            <div className="space-y-2">
                <p className="text-white text-4xl font-bold leading-tight">
                    Leave phone
                </p>
                <p className="text-white text-4xl font-bold leading-tight">
                    on desk.
                </p>
            </div>

            {/* Haptic counter — subtle feedback that it's working */}
            {
                hapticCount > 0 && (
                    <div className="text-gray-500 font-mono text-sm">
                        {hapticCount} haptic{hapticCount !== 1 ? "s" : ""} fired
                    </div>
                )
            }

            {/* Debug Console */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 p-2 text-xs font-mono text-green-400 max-h-32 overflow-y-auto">
                {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                ))}
            </div>
        </div >
    );
}