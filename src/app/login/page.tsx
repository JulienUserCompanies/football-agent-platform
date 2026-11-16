"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "sign-in" | "sign-up";
type AccountType = "family" | "institutional";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("sign-up");
  const [accountType, setAccountType] = useState<AccountType>("institutional");
  const [orgName, setOrgName] = useState("");
  const [fullName, setFullName] = useState("");
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
    <div className="min-h-screen bg-bg">
      <div className="flex items-center justify-between border-b border-line bg-surface px-14 py-5.5">
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="#0B2B20" strokeWidth="1.6" />
            <path d="M12 7l3.5 2.5-1.3 4.1h-4.4L8.5 9.5 12 7z" fill="#0B2B20" />
          </svg>
          <span className="font-display text-[17px] font-extrabold">
            Agent<span className="text-accent-dark">Index</span>
          </span>
        </Link>
        <button
          onClick={() => setMode(mode === "sign-up" ? "sign-in" : "sign-up")}
          className="text-sm text-muted"
        >
          {mode === "sign-up" ? (
            <>
              Already have an account?{" "}
              <span className="font-bold text-accent-dark">Sign in</span>
            </>
          ) : (
            <>
              Need an account?{" "}
              <span className="font-bold text-accent-dark">Sign up</span>
            </>
          )}
        </button>
      </div>

      <div className="flex justify-center px-6 py-14">
        <div className="w-full max-w-md">
          <div className="mb-7 text-center">
            <h1 className="mb-2 font-display text-2xl font-extrabold">
              {mode === "sign-up" ? "Create your account" : "Sign in"}
            </h1>
            <p className="text-sm text-muted">
              Browse the directory for free. Subscribe anytime to unlock
              verification.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-surface p-7.5">
            {mode === "sign-up" && (
              <>
                <label className="mb-2.5 block text-[13px] font-semibold">
                  I&rsquo;m signing up as…
                </label>
                <div className="mb-2 flex flex-col gap-2.5">
                  <RadioCard
                    active={accountType === "institutional"}
                    onClick={() => setAccountType("institutional")}
                    title="Institutional"
                    subtitle="Club, academy, agency or compliance team"
                  />
                  <RadioCard
                    active={accountType === "family"}
                    onClick={() => setAccountType("family")}
                    title="Players and Family"
                    subtitle="Read-only access for a parent or guardian checking an agent on a player's behalf"
                  />
                </div>
                <div className="mb-5.5 flex gap-1.5 rounded-[9px] bg-accent-tint px-3 py-2.5 text-xs leading-relaxed text-accent-dark">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="mt-0.5 flex-shrink-0">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8h.01M11 11h1v6h1" />
                  </svg>
                  <span>
                    If you&rsquo;re signing up on behalf of a player under 18,
                    this account must be held by a parent or guardian — not
                    the player.
                  </span>
                </div>
              </>
            )}

            <div className="flex flex-col gap-4">
              {mode === "sign-up" && accountType === "institutional" && (
                <Field label="Organisation name" value={orgName} onChange={setOrgName} placeholder="e.g. Riverside FC Academy" />
              )}
              {mode === "sign-up" && (
                <Field label="Full name" value={fullName} onChange={setFullName} placeholder="Your full name" />
              )}
              <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@organisation.com" />
              <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 6 characters" />
            </div>

            {message && <p className="mt-4 text-sm text-red-600">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-5.5 w-full rounded-[10px] bg-accent py-3.5 text-[15px] font-bold text-[#06241a] disabled:opacity-50"
            >
              {loading ? "…" : mode === "sign-up" ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-4.5 text-center text-[12.5px] leading-relaxed text-muted">
            AgentIndex does not list player profiles and does not facilitate
            contact with anyone under 18.
          </p>
        </div>
      </div>
    </div>
  );
}

function RadioCard({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-xl border-[1.5px] p-4 text-left ${
        active ? "border-accent bg-accent-tint" : "border-line"
      }`}
    >
      <span
        className={`mt-0.5 flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
          active ? "border-accent" : "border-line"
        }`}
      >
        {active && <span className="h-2 w-2 rounded-full bg-accent" />}
      </span>
      <span>
        <span className="mb-0.5 block text-sm font-bold">{title}</span>
        <span className="block text-[12.5px] text-muted">{subtitle}</span>
      </span>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold">{label}</label>
      <input
        type={type}
        required
        minLength={type === "password" ? 6 : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[10px] border border-line px-3.5 py-2.5 text-sm outline-none focus:border-accent"
      />
    </div>
  );
}
