"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "sign-in" | "sign-up";
type AccountType = "family" | "institutional";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("sign-up");
  const [accountType, setAccountType] = useState<AccountType>("family");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) return setMessage(error.message);
      router.push("/account");
      router.refresh();
      return;
    }

    // Sign up
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      return setMessage(error.message);
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        account_type: accountType,
        org_name: accountType === "institutional" ? orgName : null,
      });
      if (profileError) {
        setLoading(false);
        return setMessage(profileError.message);
      }
    }

    setLoading(false);
    if (!data.session) {
      setMessage("Check your email to confirm your account before signing in.");
    } else {
      router.push("/account");
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold">
        {mode === "sign-up" ? "Create an account" : "Sign in"}
      </h1>

      {mode === "sign-up" && (
        <fieldset className="mt-6">
          <legend className="text-sm font-medium">Account type</legend>
          <div className="mt-2 space-y-2 text-sm">
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="accountType"
                checked={accountType === "family"}
                onChange={() => setAccountType("family")}
                className="mt-1"
              />
              <span>
                <span className="font-medium">
                  Player / parent or guardian
                </span>
                <br />
                <span className="text-neutral-500">
                  Read-only verified agent data. If the player is under 18,
                  this account must be held by a parent or guardian, not the
                  player.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="accountType"
                checked={accountType === "institutional"}
                onChange={() => setAccountType("institutional")}
                className="mt-1"
              />
              <span>
                <span className="font-medium">Club / academy / agency</span>
                <br />
                <span className="text-neutral-500">
                  Filterable, exportable access to verified agent data.
                </span>
              </span>
            </label>
          </div>
        </fieldset>
      )}

      {mode === "sign-up" && accountType === "institutional" && (
        <div className="mt-4">
          <label className="block text-sm font-medium">
            Organisation name
          </label>
          <input
            type="text"
            required
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        {message && <p className="text-sm text-red-600">{message}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "…" : mode === "sign-up" ? "Create account" : "Sign in"}
        </button>
      </form>

      <button
        className="mt-4 text-sm text-neutral-500 underline"
        onClick={() => setMode(mode === "sign-up" ? "sign-in" : "sign-up")}
      >
        {mode === "sign-up"
          ? "Already have an account? Sign in"
          : "Need an account? Sign up"}
      </button>
    </div>
  );
}
