"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState, useRef, useEffect } from "react";
import { socket } from "@/lib/socket";

interface HapticQRCodeProps {
    sessionCode: string;
}

export function HapticQRCode({ sessionCode }: HapticQRCodeProps) {
    const [proxyLinked, setProxyLinked] = useState(false);

    // Listen for proxy confirmation
    useEffect(() => {
        socket.on("proxy:linked", () => {
            setProxyLinked(true);
        });
        return () => {
            socket.off("proxy:linked");
        };
    }, []);

    const [showQR, setShowQR] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowQR(false);
            }
        }
        if (showQR) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showQR]);

    // The URL the phone will open — includes session code and student socket id
    // We try to use the hostname if we're not on localhost, otherwise fallback to the hardcoded local IP
    // so that phones on the same WiFi can access the dev server
    const host = typeof window !== 'undefined'
        ? (window.location.hostname === 'localhost' ? '192.168.1.95' : window.location.hostname)
        : '192.168.1.95';
    const port = typeof window !== 'undefined' ? window.location.port : '3000';
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';

    const mobileUrl = `${protocol}//${host}${port ? `:${port}` : ''}/student/mobile?code=${sessionCode}&studentId=${socket.id}`;

    if (proxyLinked) {
        return (
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-green-600 text-sm font-semibold">Phone Linked</span>
            </div>
        );
    }

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setShowQR(!showQR)}
                className="text-indigo-600 text-sm font-semibold hover:text-indigo-800 transition"
            >
                Link Phone
            </button>

            {showQR && (
                <div className="absolute top-full mt-2 right-0 z-50 flex flex-col items-center gap-3 p-4 bg-white rounded-lg border shadow-xl w-64">
                    <p className="text-sm font-medium text-gray-700">
                        Scan to enable haptic feedback
                    </p>
                    <QRCodeSVG
                        value={mobileUrl}
                        size={140}
                        bgColor="#ffffff"
                        fgColor="#111318"
                        level="M"
                    />
                    <p className="text-xs text-gray-400 text-center">
                        Open on your phone to feel brick snaps
                    </p>
                </div>
            )}
        </div>
    );
}