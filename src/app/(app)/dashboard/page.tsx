import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const CHART_COLORS = [
  "#1FA862",
  "#107A47",
  "#7FE3AE",
  "#0B2B20",
  "#5E6E66",
  "#C8E3D4",
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: agents } = await supabase
    .from("agents")
    .select("name, agency, regions, specialisms, country")
    .order("name");

  const rows = agents ?? [];
  const agentCount = rows.length;

  const byAgency = new Map<string, number>();
  for (const a of rows) {
    const key = a.agency ?? "Independent";
    byAgency.set(key, (byAgency.get(key) ?? 0) + 1);
  }
  const agencyEntries = [...byAgency.entries()].sort((a, b) => b[1] - a[1]);
  const agencyCount = agencyEntries.length;
  const topAgencyEntries = agencyEntries.filter(([a]) => a !== "Independent").slice(0, 8);
  const maxAgencyCount = Math.max(1, ...topAgencyEntries.map(([, n]) => n));

  const byCountry = new Map<string, number>();
  for (const a of rows) {
    const key = a.country ?? "Unknown";
    byCountry.set(key, (byCountry.get(key) ?? 0) + 1);
  }
  const countryEntries = [...byCountry.entries()].sort((a, b) => b[1] - a[1]);
  const countryCount = countryEntries.length;
  const maxCountryCount = Math.max(1, ...countryEntries.map(([, n]) => n));

  const bySpecialism = new Map<string, number>();
  for (const a of rows) {
    for (const s of a.specialisms ?? []) {
      bySpecialism.set(s, (bySpecialism.get(s) ?? 0) + 1);
    }
  }
  const specialismEntries = [...bySpecialism.entries()].sort(
    (a, b) => b[1] - a[1]
  );
  const specialismTotal =
    specialismEntries.reduce((sum, [, n]) => sum + n, 0) || 1;

  const donutStops = specialismEntries.reduce<
    { label: string; n: number; color: string; start: number; end: number }[]
  >((acc, [label, n], i) => {
    const prevEnd = acc.length ? acc[acc.length - 1].end : 0;
    const start = prevEnd;
    const end = start + (n / specialismTotal) * 360;
    acc.push({ label, n, color: CHART_COLORS[i % CHART_COLORS.length], start, end });
    return acc;
  }, []);
  const donutGradient = donutStops.length
    ? `conic-gradient(${donutStops
        .map((s) => `${s.color} ${s.start}deg ${s.end}deg`)
        .join(", ")})`
    : "var(--color-accent-tint)";

  const initials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div className="mx-auto max-w-5xl px-10 py-9">
      <div className="mb-7 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            A live snapshot of everything listed on AgentIndex.
          </p>
        </div>
        <Link href="/agents" className="text-[14px] font-bold text-accent-dark">
          Go to the directory →
        </Link>
      </div>

      {/* hero search banner */}
      <div
        className="mb-6 rounded-2xl px-8 py-7"
        style={{ background: "linear-gradient(120deg, #0B2B20 0%, #15502F 100%)" }}
      >
        <h2 className="mb-1.5 font-display text-xl font-extrabold text-white">
          Find a licensed agent in seconds
        </h2>
        <p className="max-w-xl text-[13.5px] leading-relaxed text-[#C8E3D4]">
          {agentCount} agents across {countryCount} countr{countryCount === 1 ? "y" : "ies"} and{" "}
          {agencyCount} agencies, checked against each country&rsquo;s
          national federation register.
        </p>
      </div>

      {/* stat tiles */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Tile label="Agents listed" value={String(agentCount)} />
        <Tile label="Countries covered" value={String(countryCount)} />
        <Tile label="Agencies represented" value={String(agencyCount)} />
        <Tile label="Specialisms covered" value={String(specialismEntries.length)} />
      </div>

      {/* charts */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="mb-5 text-[15px] font-bold">Agents by country</h3>
          <div className="flex flex-col gap-3">
            {countryEntries.map(([country, n]) => (
              <div key={country} className="flex items-center gap-3">
                <div className="w-28 flex-shrink-0 truncate text-[12.5px] text-muted" title={country}>
                  {country}
                </div>
                <div className="h-5 flex-1 overflow-hidden rounded-full bg-accent-tint">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(n / maxCountryCount) * 100}%` }}
                  />
                </div>
                <div className="w-10 flex-shrink-0 text-right text-[12.5px] font-bold">{n}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="mb-1 text-[15px] font-bold">Top agencies</h3>
          <p className="mb-4 text-[12px] text-muted">Independent agents excluded — top 8 by agent count</p>
          <div className="flex flex-col gap-3">
            {topAgencyEntries.map(([agency, n]) => (
              <div key={agency} className="flex items-center gap-3">
                <div className="w-32 flex-shrink-0 truncate text-[12.5px] text-muted" title={agency}>
                  {agency}
                </div>
                <div className="h-5 flex-1 overflow-hidden rounded-full bg-accent-tint">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(n / maxAgencyCount) * 100}%` }}
                  />
                </div>
                <div className="w-5 flex-shrink-0 text-right text-[12.5px] font-bold">{n}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h3 className="mb-5 text-[15px] font-bold">Agents by specialism</h3>
          <div className="flex items-center gap-6">
            <div
              className="h-36 w-36 flex-shrink-0 rounded-full"
              style={{ background: donutGradient }}
            >
              <div className="m-auto mt-[22px] flex h-[92px] w-[92px] items-center justify-center rounded-full bg-surface">
                <span className="font-display text-lg font-extrabold">{agentCount}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {donutStops.map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-[12.5px]">
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                    style={{ background: s.color }}
                  />
                  <span className="text-muted">{s.label}</span>
                  <span className="font-semibold">{s.n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* agent list preview */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h3 className="text-[15px] font-bold">Recently listed</h3>
          <Link href="/agents" className="text-[13.5px] font-bold text-accent-dark">
            View all
          </Link>
        </div>
        {rows.slice(0, 5).map((a, i) => (
          <div
            key={a.name}
            className={`flex items-center gap-4 px-6 py-3.5 ${i < Math.min(rows.length, 5) - 1 ? "border-b border-line" : ""}`}
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
              {initials(a.name)}
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-bold">{a.name}</div>
              <div className="text-xs text-muted">{a.agency ?? "Independent"}</div>
            </div>
            <span className="rounded-full bg-accent-tint px-2.5 py-1 text-[11px] font-semibold text-accent-dark">
              {(a.specialisms ?? [])[0] ?? "—"}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-[14px] bg-accent-tint px-6 py-4 text-[12.5px] leading-relaxed text-accent-dark">
        This directory lists agents only. It does not list player profiles
        and does not facilitate contact with anyone under 18.
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="mb-1 text-xs text-muted">{label}</div>
      <div className="font-display text-2xl font-extrabold tabular-nums">{value}</div>
    </div>
  );
}
