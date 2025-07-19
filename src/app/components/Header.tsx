"use client";

import { useSession, signOut } from "next-auth/react";
// import Image from "next/image";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="w-full flex justify-between items-center bg-lavender border-b border-teal px-6 py-4 shadow-sm">
      {/* Logo Placeholder */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-teal rounded-full flex items-center justify-center text-white font-bold">
          {/* Placeholder text or icon */}
          L
        </div>
        <h1 className="text-xl font-semibold text-teal">Birthday Reminder</h1>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-4">
        <span className="text-gray-700">
          {session?.user?.username ? `Hello, ${session.user.username}` : "Welcome"}
        </span>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
