import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function Check() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#7FE3AE"
      strokeWidth="2.4"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CheckDark() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-accent-dark)"
      strokeWidth="2.2"
      style={{ flexShrink: 0, marginTop: 1 }}
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function LockBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#F0F3F1] px-2.5 py-1 text-xs font-semibold text-[#A4ADA7]">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="5" y="10" width="14" height="9" rx="2" />
        <path d="M8 10V7a4 4 0 018 0v3" />
      </svg>
      Subscribers only
    </span>
  );
}

export default async function HomePage() {
  const supabase = await createClient();

  const [{ count: agentCount }, { data: agencyRows }, { data: countryRows }, { data: previewAgents }] =
    await Promise.all([
      supabase.from("agents").select("*", { count: "exact", head: true }),
      supabase.from("agents").select("agency"),
      supabase.from("agents").select("country"),
      supabase
        .from("agents")
        .select("name, agency, regions, specialisms")
        .order("name")
        .limit(3),
    ]);

  const agencyCount = new Set(
    (agencyRows ?? []).map((r) => r.agency).filter(Boolean)
  ).size;

  const countryCount = new Set(
    (countryRows ?? []).map((r) => r.country).filter(Boolean)
  ).size;

  const initials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div className="bg-surface">
      {/* ===== Nav ===== */}
      <div className="flex items-center justify-between border-b border-line px-14 py-5">
        <div className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="#0B2B20" strokeWidth="1.6" />
            <path d="M12 7l3.5 2.5-1.3 4.1h-4.4L8.5 9.5 12 7z" fill="#0B2B20" />
          </svg>
          <span className="font-display text-lg font-extrabold">
            Agent<span className="text-accent-dark">Index</span>
          </span>
        </div>
        <nav className="hidden gap-8 md:flex">
          <Link href="/dashboard" className="text-[14.5px] font-semibold text-muted hover:text-ink">
            Dashboard
          </Link>
          <Link href="/agents" className="text-[14.5px] font-semibold text-muted hover:text-ink">
            Browse agents
          </Link>
          <Link href="/pricing" className="text-[14.5px] font-semibold text-muted hover:text-ink">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-[14.5px] font-semibold text-muted hover:text-ink">
            Sign in
          </Link>
          <Link
            href="/agents"
            className="rounded-[10px] bg-accent px-5 py-2.5 text-sm font-bold text-[#06241a]"
          >
            Browse the directory
          </Link>
        </div>
      </div>

      {/* ===== Hero ===== */}
      <div
        className="relative overflow-hidden px-14 pb-16 pt-18"
        style={{
          background:
            "linear-gradient(120deg, #0B2B20 0%, #0F3A28 55%, #15502F 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-[420px] w-[420px] rounded-full bg-accent opacity-10"
          aria-hidden="true"
        />
        <div className="relative max-w-2xl">
          <div className="mb-4 text-xs font-bold tracking-[0.09em] text-[#7FE3AE]">
            FIND YOUR AGENT, REGISTER-VERIFIED
          </div>
          <h1 className="mb-5 font-display text-5xl font-extrabold leading-[1.14] text-white">
            Find the right licensed agent — and know who you&rsquo;re{" "}
            <span className="text-[#7FE3AE]">connecting</span> with
          </h1>
          <p className="mb-8 max-w-xl text-base leading-relaxed text-[#C8E3D4]">
            AgentIndex helps clubs, agencies and families find a licensed
            football agent that fits — by region, agency and specialism —
            then cross-checks them against the national federation&rsquo;s
            public register in their country, so you know exactly who
            you&rsquo;re connecting with before you make contact.
          </p>
          <div className="mb-9 flex gap-3.5">
            <Link
              href="/agents"
              className="inline-flex items-center gap-2 rounded-[10px] bg-accent px-6 py-3 text-[14.5px] font-bold text-[#06241a]"
            >
              Find an agent
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-[10px] border-[1.5px] border-white/35 bg-white/10 px-5 py-2.5 text-[14.5px] font-bold text-white"
            >
              See institutional access
            </Link>
          </div>
          <div className="flex flex-wrap gap-7 text-[13px] font-semibold text-[#AFCCBD]">
            <span className="flex items-center gap-1.5">
              <Check /> {agentCount ?? "—"} agents sourced from {countryCount || "4"} national registers
            </span>
            <span className="flex items-center gap-1.5">
              <Check /> Free to browse
            </span>
            <span className="flex items-center gap-1.5">
              <Check /> No contact facilitation with under-18s
            </span>
          </div>
        </div>
      </div>

      {/* ===== Stat strip ===== */}
      <div className="flex justify-center px-14" style={{ transform: "translateY(-32px)" }}>
        <div
          className="flex w-full max-w-5xl rounded-2xl border border-line bg-surface shadow-[0_10px_30px_rgba(11,43,32,0.08)]"
        >
          <StatTile label="Agents listed" value={String(agentCount ?? "—")} border />
          <StatTile label="Agencies represented" value={String(agencyCount || "—")} border />
          <StatTile label="Countries covered, expanding" value={String(countryCount || "4")} border />
          <StatTile label="National federations" value="4" />
        </div>
      </div>

      {/* ===== How it works ===== */}
      <div className="mx-auto max-w-5xl px-14 pb-2 pt-8">
        <div className="mx-auto mb-11 max-w-xl text-center">
          <div className="mb-2.5 text-xs font-bold tracking-wider text-accent-dark">
            HOW IT WORKS
          </div>
          <h2 className="mb-2.5 font-display text-[28px] font-extrabold">
            Find the right agent, then connect with confidence
          </h2>
          <p className="text-[15px] leading-relaxed text-muted">
            Every listing starts from a national federation&rsquo;s own
            public register — not a scraped CV or a self-submitted profile.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
          <Step n={1} title="Search, free" body="Search licensed agents by region, agency and specialism — non-league, women's football, senior professional and more. No account required." />
          <Step n={2} title="Subscribe to verify" body="Unlock licence status, FA registration number and minors-authorisation for any agent, sourced and re-checked against the register." />
          <Step n={3} title="Act with confidence" body="Clubs and agencies get filterable, exportable access; players and families get a straightforward read-only check, no contact facilitation." />
        </div>
      </div>

      {/* ===== Two audiences ===== */}
      <div className="mx-auto max-w-5xl px-14 pb-2 pt-16">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <div className="mb-2.5 text-xs font-bold tracking-wider text-accent-dark">
            BUILT FOR TWO AUDIENCES
          </div>
          <h2 className="font-display text-[28px] font-extrabold">
            Whoever you are, the same verified data
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface p-8">
            <div className="mb-4.5 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-tint">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-dark)" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M3 9h18M8 4v16" />
              </svg>
            </div>
            <h3 className="mb-2.5 font-display text-lg font-extrabold">
              For clubs, academies &amp; agencies
            </h3>
            <p className="mb-4.5 text-sm leading-relaxed text-muted">
              Institutional access gives recruitment and compliance teams the
              whole picture in one place.
            </p>
            <ul className="mb-5 flex flex-col gap-2.5 text-[13.5px]">
              <li className="flex gap-2"><CheckDark />Filter by region, agency, specialism and licence status</li>
              <li className="flex gap-2"><CheckDark />Export results for compliance records</li>
              <li className="flex gap-2"><CheckDark />API access on higher tiers</li>
            </ul>
            <Link href="/pricing" className="inline-block rounded-[10px] bg-ink px-6 py-3 text-[14.5px] font-bold text-white">
              View institutional pricing
            </Link>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-8">
            <div className="mb-4.5 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-tint">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-dark)" strokeWidth="1.8">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
              </svg>
            </div>
            <h3 className="mb-2.5 font-display text-lg font-extrabold">
              For players &amp; families
            </h3>
            <p className="mb-4.5 text-sm leading-relaxed text-muted">
              A read-only subscription held by a parent or guardian for any
              player under 18 — never the player themselves.
            </p>
            <ul className="mb-5 flex flex-col gap-2.5 text-[13.5px]">
              <li className="flex gap-2"><CheckDark />Check licence status before signing with anyone</li>
              <li className="flex gap-2"><CheckDark />See minors-authorisation where it applies</li>
              <li className="flex gap-2"><CheckDark />No messaging, no introductions — data only</li>
            </ul>
            <Link href="/pricing" className="inline-block rounded-[10px] bg-accent-tint px-6 py-3 text-[14.5px] font-bold text-accent-dark">
              View family pricing
            </Link>
          </div>
        </div>
      </div>

      {/* ===== Directory preview ===== */}
      <div className="mx-auto max-w-5xl px-14 pb-2 pt-16">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="mb-2.5 text-xs font-bold tracking-wider text-accent-dark">THE DIRECTORY</div>
            <h2 className="font-display text-[28px] font-extrabold">A look at what&rsquo;s inside</h2>
          </div>
          <Link href="/agents" className="text-[14.5px] font-bold text-accent-dark">
            Explore the full directory →
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          {(previewAgents ?? []).map((agent, i) => (
            <div
              key={agent.name}
              className={`flex items-center gap-4 px-6 py-4 ${i < (previewAgents?.length ?? 0) - 1 ? "border-b border-line" : ""}`}
            >
              <div className="flex h-8.5 w-8.5 flex-shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                {initials(agent.name)}
              </div>
              <div className="flex-1">
                <div className="text-[14.5px] font-bold">{agent.name}</div>
                <div className="text-[13px] text-muted">{agent.agency ?? "Independent"}</div>
              </div>
              <div className="hidden gap-2 sm:flex">
                {(agent.regions ?? []).slice(0, 1).map((r: string) => (
                  <span key={r} className="rounded-full bg-accent-tint px-2.5 py-1 text-[11.5px] font-semibold text-accent-dark">
                    {r}
                  </span>
                ))}
                {(agent.specialisms ?? []).slice(0, 1).map((s: string) => (
                  <span key={s} className="rounded-full bg-accent-tint px-2.5 py-1 text-[11.5px] font-semibold text-accent-dark">
                    {s}
                  </span>
                ))}
              </div>
              <LockBadge />
            </div>
          ))}
        </div>
      </div>

      {/* ===== Trust / safeguarding ===== */}
      <div className="mx-auto max-w-5xl px-14 pb-2 pt-14">
        <div className="flex items-start gap-7 rounded-[18px] bg-accent-tint p-8">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-dark)" strokeWidth="1.8">
              <path d="M12 3l8 3v5c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6l8-3z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h3 className="mb-2 font-display text-[17px] font-extrabold text-accent-dark">
              What this directory doesn&rsquo;t do
            </h3>
            <p className="max-w-3xl text-sm leading-relaxed text-[#1C4A33]">
              AgentIndex does not list player profiles and does not
              facilitate contact with anyone under 18, in either direction.
              Every account for a player under 18 is held by a parent or
              guardian, and no tier includes messaging or introductions — it
              is a verification lookup, not a marketplace.
            </p>
          </div>
        </div>
      </div>

      {/* ===== Final CTA ===== */}
      <div
        className="mx-14 mt-14 flex flex-col items-start justify-between gap-6 rounded-[22px] px-14 py-13 sm:flex-row sm:items-center"
        style={{ background: "linear-gradient(120deg, #0B2B20 0%, #15502F 100%)" }}
      >
        <div className="max-w-xl">
          <h2 className="mb-2.5 font-display text-[28px] font-extrabold text-white">
            Start browsing — it&rsquo;s free
          </h2>
          <p className="text-[14.5px] leading-relaxed text-[#C8E3D4]">
            No account needed to search. Subscribe only when you need the
            verification detail.
          </p>
        </div>
        <div className="flex gap-3.5">
          <Link href="/agents" className="rounded-[10px] bg-accent px-6 py-3 text-[14.5px] font-bold text-[#06241a]">
            Browse the directory
          </Link>
          <Link href="/pricing" className="rounded-[10px] border-[1.5px] border-white/35 bg-white/10 px-5 py-2.5 text-[14.5px] font-bold text-white">
            See pricing
          </Link>
        </div>
      </div>

      {/* ===== Footer ===== */}
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-14 pb-10 pt-14 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <div className="mb-3.5 flex items-center gap-2.5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="#0B2B20" strokeWidth="1.6" />
              <path d="M12 7l3.5 2.5-1.3 4.1h-4.4L8.5 9.5 12 7z" fill="#0B2B20" />
            </svg>
            <span className="font-display text-base font-extrabold">
              Agent<span className="text-accent-dark">Index</span>
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-muted">
            The register-verified directory of licensed football agents,
            across England, Ireland, the Netherlands and Italy. Working
            name — not a final brand.
          </p>
        </div>
        <div className="flex gap-16">
          <FooterCol
            title="Directory"
            links={[
              ["Browse agents", "/agents"],
              ["Pricing", "/pricing"],
              ["Dashboard", "/dashboard"],
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              ["About", "#"],
              ["Contact", "#"],
              ["Safeguarding policy", "#"],
            ]}
          />
        </div>
      </div>
      <div className="border-t border-line px-14 py-5 text-center text-[12.5px] text-muted">
        © 2026 AgentIndex. Agent data sourced from the FA, FAI, KNVB and
        FIGC public registers of licensed football agents.
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  border,
}: {
  label: string;
  value: string;
  border?: boolean;
}) {
  return (
    <div
      className={`flex flex-1 items-center gap-3.5 px-7 py-6 ${border ? "border-r border-line" : ""}`}
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-accent-tint">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-dark)" strokeWidth="1.8">
          <rect x="3" y="3" width="8" height="8" rx="2" />
          <rect x="13" y="3" width="8" height="8" rx="2" />
          <rect x="3" y="13" width="8" height="8" rx="2" />
          <rect x="13" y="13" width="8" height="8" rx="2" />
        </svg>
      </div>
      <div>
        <div className="font-display text-xl font-extrabold tabular-nums">{value}</div>
        <div className="text-[12.5px] text-muted">{label}</div>
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div>
      <div className="mb-4.5 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-tint font-display text-base font-extrabold text-accent-dark">
        {n}
      </div>
      <h3 className="mb-2 text-[17px] font-bold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="mb-3.5 text-[13px] font-bold uppercase tracking-wide text-muted">{title}</div>
      <div className="flex flex-col gap-2.5 text-[13.5px] text-muted">
        {links.map(([label, href]) => (
          <Link key={label} href={href}>{label}</Link>
        ))}
      </div>
    </div>
  );
}
