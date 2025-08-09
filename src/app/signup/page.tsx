"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Submit-only validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setFormError("");

    let hasError = false;

    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      hasError = true;
    }
    if (!passwordRegex.test(password)) {
      setPasswordError(
        "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character."
      );
      hasError = true;
    }
    if (!username.trim()) {
      setFormError("Username is required.");
      hasError = true;
    }
    if (hasError) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/signup", {
        method: "POST",
        body: JSON.stringify({ email, username, password }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        router.push("/login");
      } else if (res.status === 409) {
        setFormError("An account with this email already exists.");
      } else {
        setFormError("Sign-up failed. Please try again.");
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 grid place-items-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white/90 backdrop-blur rounded-2xl shadow-lg ring-1 ring-black/5 p-6 md:p-8 translate-y-3 md:translate-y-20"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-6">
          Sign Up
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
          className={`w-full text-gray-900 placeholder:text-gray-400 bg-white border rounded-lg h-11 px-3 mb-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
            emailError ? "border-red-500" : "border-gray-300"
          }`}
          required
        />
        {emailError && <p className="text-red-600 text-sm mb-3">{emailError}</p>}

        {/* Username */}
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
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
            autoComplete="new-password"
            className={`w-full text-gray-900 placeholder:text-gray-400 bg-white border rounded-lg h-11 px-3 pr-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
              passwordError ? "border-red-500" : "border-gray-300"
            }`}
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
        {passwordError && <p className="text-red-600 text-sm mb-3">{passwordError}</p>}

        {/* Form-level error */}
        {formError && <p className="text-red-600 text-sm mb-3">{formError}</p>}

        {/* Submit */}
        <button
          type="submit"
          id="submit"
          disabled={submitting}
          className="w-full h-11 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {submitting ? "Signing up…" : "Sign Up"}
        </button>

        <p className="mt-5 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-700 hover:underline">
            Log in here
          </a>
        </p>
      </form>
    </div>
  );
}