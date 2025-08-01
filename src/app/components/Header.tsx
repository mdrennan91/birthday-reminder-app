"use client";

import Image from "next/image";


import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="w-full flex justify-between items-center bg-lavender border-b px-6 py-4 shadow-sm">
      {/* Logo + Title */}
      <div className="flex items-center gap-2">
        <Image
          src="/birthday-logo.png"
          alt="Birthday Reminder logo"
          width={40}
          height={40}
          className="object-contain"
        />
        <h1 className="text-xl font-bold text-teal">Birthday Reminder</h1>
      </div>

      {/* User Greeting and Auth Buttons */}
      <div className="flex items-center gap-4">
        {/* If signed in */}
        {session?.user?.username ? (
          <>
            <span className="text-gray-700">
              Hello, {session.user.username}
            </span>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
            >
              Logout
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}