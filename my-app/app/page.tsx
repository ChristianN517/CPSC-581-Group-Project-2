"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main
      className="h-screen bg-cover bg-center flex flex-col"
      style={{ backgroundImage: "url('/cad.jpeg')" }}
    >
      {/* Page container*/}
      <div className="bg-black/60 flex-1 flex flex-col items-center justify-center">

        {/* Title */}
        <h1 className="text-white text-6xl font-bold mb-16  text-center">
          CAD Learning Platform
        </h1>

        {/* Buttons */}
        <div className="flex gap-8">
            <button
            onClick={() => router.push("/student")}
            className="px-10 py-4 border-2 border-white text-white text-lg rounded-lg hover:bg-white hover:text-black transition duration-300"
          >
            Student Portal
          </button>


          <button
            onClick={() => router.push("/expert")}
            className="px-10 py-4 border-2 border-white  text-white text-lg rounded-lg hover:bg-white hover:text-black transition duration-300"
          >
            Expert Portal
          </button>
        </div>

      </div>
    </main>
  );
}