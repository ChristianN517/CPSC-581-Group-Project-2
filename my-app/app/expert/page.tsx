"use client";

import { useRouter } from "next/navigation";

export default function ExpertHome() {
  const router = useRouter();

  const students = [
    { id: "stu1", name: "Chris" },
    { id: "stu2", name: "Grace" },
    { id: "stu3", name: "Caleb" },
    { id: "stu4", name: "JJ" },
  ];

  const modules = [
    { id: "1", title: "Intro to CAD" },
    { id: "2", title: "3D Modeling Basics" },
  ];

  return (
    <main className="h-screen p-10 bg-green-50">

      <h1 className="text-3xl font-bold mb-8 text-black">
        Expert Dashboard
      </h1>

      {/* STUDENT TABS */}
      <h2 className="text-xl font-semibold mb-4 text-black">
        Active Students
      </h2>

      <div className="flex gap-4 mb-10">
        {students.map((student) => (
          <button
            key={student.id}
            onClick={() =>
              router.push(`/expert/students/${student.id}`)
            }
            className="px-6 py-3 bg-green-600 text-white rounded"
          >
            {student.name}
          </button>
        ))}
      </div>

      {/* MODULE MANAGEMENT */}
      <h2 className="text-xl font-semibold mb-4 text-black">
        Modules
      </h2>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {modules.map((module) => (
          <div
            key={module.id}
            className="bg-white p-6 rounded shadow text-black"
          >
            {module.title}
          </div>
        ))}
      </div>

      <button className="px-6 py-3 bg-blue-600 text-white rounded">
        + Create New Module
      </button>

    </main>
  );
}