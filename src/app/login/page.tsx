"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.ok) {
      router.push("/");
    } else {
      alert("Login failed.");
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full text-black p-2 border mb-2"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full text-black p-2 border mb-4"
        required
      />
      <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
        Log In
      </button>

      <p className="mt-4 text-sm text-center">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="text-blue-800 hover:underline">
          Sign up here
        </a>
      </p>
    </form>
  );
}
