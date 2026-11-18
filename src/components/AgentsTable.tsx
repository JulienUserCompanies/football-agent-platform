"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Agent = {
  slug: string;
  name: string;
  agency: string | null;
  regions: string[] | null;
  specialisms: string[] | null;
  country: string | null;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AgentsTable({ agents }: { agents: Agent[] }) {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");

  const countries = useMemo(
    () => [...new Set(agents.map((a) => a.country).filter(Boolean) as string[])].sort(),
    [agents]
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return agents.filter((a) => {
      if (country && a.country !== country) return false;
      if (!needle) return true;
      return [a.name, a.agency ?? "", a.country ?? "", ...(a.regions ?? []), ...(a.specialisms ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [agents, q, country]);

  return (
    <>
      <div className="mt-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, agency, region, specialism…"
            className="w-full rounded-[10px] border border-line bg-surface py-2.5 pl-10 pr-3 text-[13.5px] outline-none focus:border-accent"
          />
        </div>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded-[10px] border border-line bg-surface py-2.5 px-3 text-[13.5px] outline-none focus:border-accent"
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="text-[12.5px] text-muted">
          {filtered.length} of {agents.length} agents
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="hidden grid-cols-[2fr_1.2fr_0.9fr_1.4fr_auto] gap-4 border-b border-line px-6 py-3 text-[12px] font-bold uppercase tracking-wide text-muted sm:grid">
          <div>Name</div>
          <div>Agency</div>
          <div>Country</div>
          <div>Specialism</div>
          <div />
        </div>
        {filtered.map((agent, i) => (
          <Link
            key={agent.slug}
            href={`/agents/${agent.slug}`}
            className={`flex flex-col gap-2 px-6 py-4 hover:bg-bg sm:grid sm:grid-cols-[2fr_1.2fr_0.9fr_1.4fr_auto] sm:items-center sm:gap-4 ${
              i < filtered.length - 1 ? "border-b border-line" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
                {initials(agent.name)}
              </div>
              <span className="text-[14.5px] font-bold">{agent.name}</span>
            </div>
            <div className="text-[13.5px] text-muted">{agent.agency ?? "Independent"}</div>
            <div className="text-[13.5px] text-muted">{agent.country ?? "—"}</div>
            <div className="flex flex-wrap gap-1.5">
              {(agent.specialisms ?? []).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-accent-tint px-2.5 py-1 text-[11px] font-semibold text-accent-dark"
                >
                  {s}
                </span>
              ))}
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-[#F0F3F1] px-2.5 py-1 text-xs font-semibold text-[#A4ADA7]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="10" width="14" height="9" rx="2" />
                <path d="M8 10V7a4 4 0 018 0v3" />
              </svg>
              Subscribers only
            </span>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-muted">
            No agents match &ldquo;{q}&rdquo;.
          </div>
        )}
      </div>
    </>
  );
}
