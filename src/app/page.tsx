import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

// Removed the console.log statement to avoid logging sensitive session data.

  async function handleSignOut() {
    "use server";
    redirect("/api/auth/signout");
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome</h1>
      {session?.user ? (
        <>
          <p>Hello, {session.user.username} 👋</p>
          <form action={handleSignOut}>
            <button type="submit" className="mt-4 p-2 bg-red-600 text-white rounded">
              Sign Out
            </button>
          </form>
        </>
      ) : (
        <p>You are not logged in.</p>
      )}
    </main>
  );
}
