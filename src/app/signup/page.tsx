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

  function isValidEmail(email: string) {
    // Simple email regex for server-side validation
    const attempt = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
      email
    );
    const emailInput = document.getElementById("email");
    if (!attempt) {
      if (emailInput) {
        (emailInput as HTMLInputElement).style.border = "3px solid red";
      }
      setEmailError("Please enter a valid email address.");
    } else {
      if (emailInput) {
        (emailInput as HTMLInputElement).style.border = "none";
      }
      setEmailError("");
    }
    return email;
  }

  function isValidPassword(password: string) {
    const attempt = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{7,}$/.test(
      password
    );
    const passwordInput = document.getElementById("password");
    if (!attempt) {
      if (passwordInput) {
        (passwordInput as HTMLInputElement).style.border = "3px solid red";
      }
      setPasswordError(
        "Password must be at least 7 characters long and include uppercase, lowercase, number, and special character."
      );
    } else {
      if (passwordInput) {
        (passwordInput as HTMLInputElement).style.border = "none";
      }
      setPasswordError("");
    }
    return password;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/signup", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      router.push("/login");
    } else {
      alert("Sign-up failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Sign Up</h2>
      <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setTimeout(() => {
            isValidEmail(e.target.value);
          }, 500);
        }}
        placeholder="Email"
        pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        className="w-full text-black border p-2 mb-2"
        required
      />
      {emailError && (
        <p className="text-red-600 text-sm mb-2">{emailError}</p>
      )}
      <input
        type="text"
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="w-full text-black p-2 border mb-2"
        required
      />
      <input
        type="password"
        id="password"
        value={password}
        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{7,}$"
        onChange={(e) => {
          setPassword(e.target.value);
          setTimeout(() => {
            isValidPassword(e.target.value);
          }, 500);
        }}
        placeholder="Password"
        className="w-full text-black p-2 border mb-4"
        required
      />
      {passwordError && (
        <p className="text-red-600 text-sm mb-2">{passwordError}</p>
      )}
      <button
        type="submit"
        id="submit"
        className="w-full bg-blue-600 text-white p-2 rounded disabled:bg-gray-400"
        disabled={!!emailError || !!passwordError}
      >
        Sign Up
      </button>
      <p className="mt-4 text-sm text-center">
        Already have an account?{" "}
        <a href="/login" className="text-blue-800 hover:underline">
          Log in here
        </a>
      </p>
    </form>
  );
}
