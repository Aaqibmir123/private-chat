"use client";

import { useState, type FormEvent } from "react";
import axios from "axios";
import api from "@/lib/api";
import type { AuthResponse } from "@/lib/types";

type Props = {
  onAuth: (auth: AuthResponse) => void;
};

export default function AuthCard({ onAuth }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "login" ? { phone, password } : { name, phone, password };
      const { data } = await api.post<AuthResponse>(endpoint, payload);
      onAuth(data);
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? ((err.response?.data as { message?: string } | undefined)?.message ??
          "Something went wrong")
        : "Something went wrong";

      setError(
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
      <div className="w-full rounded-3xl border border-border bg-surfaceAlt/95 p-6 shadow-soft backdrop-blur">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-brand">
            Private Chat
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">
            {mode === "login" ? "Login" : "Create account"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Use one of the two approved phone numbers with password 123456.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-brand"
              required
            />
          )}
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="numeric"
            placeholder="Phone number"
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-brand"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-brand"
            required
          />
          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            disabled={loading}
            className="w-full rounded-2xl bg-brand px-4 py-3 font-medium text-white transition hover:bg-brandDeep disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Register"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="mt-4 w-full text-sm font-medium text-brand transition hover:text-brandDeep"
        >
          {mode === "login"
            ? "Need to register one of the numbers?"
            : "Already registered? Back to login"}
        </button>
      </div>
    </div>
  );
}
