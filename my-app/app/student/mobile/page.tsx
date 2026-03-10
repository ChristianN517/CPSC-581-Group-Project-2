"use client";

import dynamic from "next/dynamic";

const MobileProxyInner = dynamic(() => import("@/components/MobileProxyInner"), {
    ssr: false,
    loading: () => <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
});

export default function MobileProxy() {
    return <MobileProxyInner />;
}