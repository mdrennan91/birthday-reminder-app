"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.ok) {
      router.push("/");
    } else {
      alert("Login failed.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 grid place-items-center px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white/90 backdrop-blur rounded-2xl shadow-lg ring-1 ring-black/5 p-6 md:p-8
               translate-y-3 md:translate-y-20"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-6">
          Login
        </h2>

        {/* Email */}
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          className="w-full text-gray-900 placeholder:text-gray-400 bg-white border border-gray-300 rounded-lg h-11 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          required
        />

        {/* Password */}
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative mb-5">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full text-gray-900 placeholder:text-gray-400 bg-white border border-gray-300 rounded-lg h-11 px-3 pr-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 active:scale-[.99] transition"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 rounded-lg bg-green-600 text-white font-medium shadow hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {submitting ? "Logging in…" : "Log In"}
        </button>

        <p className="mt-5 text-sm text-center text-gray-600">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-blue-700 hover:underline">
            Sign up here
          </a>
        </p>
      </form>
    </div>
  );
}