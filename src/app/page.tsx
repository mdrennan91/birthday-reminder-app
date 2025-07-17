"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
      {session ? (
        <>
          <p className="text-lg">Signed in as {session.user?.email}</p>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Sign out
          </button>
        </>
      ) : (
        <>
          <p className="text-lg">You are not signed in</p>
          <button
            onClick={() => signIn("github")}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Sign in with GitHub
          </button>
        </>
      )}
    </div>
  );
}
