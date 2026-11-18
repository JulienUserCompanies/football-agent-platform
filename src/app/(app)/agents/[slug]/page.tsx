import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function AgentDetailPage({
  params,
}: PageProps<"/agents/[slug]">) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: agent } = await supabase
    .from("agents")
    .select("id, slug, name, agency, regions, specialisms, website, country")
    .eq("slug", slug)
    .single();

  if (!agent) notFound();

  // RLS on agent_verification only returns a row if the signed-in user
  // holds an active subscription. No row back here means "not visible to
  // you right now", not "agent has no verification data".
  const { data: verification } = await supabase
    .from("agent_verification")
    .select(
      "license_body, license_status, reg_number, license_source, checked_on, minors_authorised, minors_authorised_until, bio, featured"
    )
    .eq("agent_id", agent.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-5xl px-10 py-9">
      <div className="mb-5 text-[13px] font-semibold text-muted">
        <Link href="/agents">Home / Directory</Link> / <span className="text-ink">{agent.name}</span>
      </div>

      <div className="flex items-start justify-between gap-6 rounded-2xl border border-line bg-surface p-7">
        <div className="flex gap-5">
          <div className="flex h-19 w-19 flex-shrink-0 items-center justify-center rounded-full bg-accent text-2xl font-bold text-white">
            {initials(agent.name)}
          </div>
          <div>
            <h1 className="mb-2 font-display text-2xl font-extrabold">{agent.name}</h1>
            <div className="mb-2.5 text-sm text-muted">
              {agent.agency ?? "Independent"}
              {agent.country ? ` · ${agent.country}` : ""}
            </div>
            <div className="flex flex-wrap gap-2">
              {(agent.regions ?? []).map((r: string) => (
                <span key={r} className="rounded-full bg-accent-tint px-2.5 py-1 text-xs font-semibold text-accent-dark">
                  {r}
                </span>
              ))}
              {(agent.specialisms ?? []).map((s: string) => (
                <span key={s} className="rounded-full bg-accent-tint px-2.5 py-1 text-xs font-semibold text-accent-dark">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* at a glance */}
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Tile label="Agency" value={agent.agency ?? "Independent"} />
        <Tile label="Country" value={agent.country ?? "—"} />
        <Tile label="Specialism" value={(agent.specialisms ?? [])[0] ?? "—"} />
        <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-4">
          <div className="mb-1 text-xs text-muted">Licence status</div>
          {verification ? (
            <div className="text-[13.5px] font-bold">
              {verification.license_status} &middot; {verification.reg_number ?? "—"}
            </div>
          ) : (
            <>
              <div className="select-none text-[13.5px] font-bold blur-[4px]">Active &middot; FA2381</div>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#A4ADA7"
                strokeWidth="2.2"
                className="absolute right-4 top-4"
              >
                <rect x="5" y="10" width="14" height="9" rx="2" />
                <path d="M8 10V7a4 4 0 018 0v3" />
              </svg>
            </>
          )}
        </div>
      </div>

      {verification ? (
        <div className="mt-5 rounded-2xl border border-line bg-surface p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">
            Verification
          </h2>
          <dl className="space-y-3 text-sm">
            <Row label="License body" value={verification.license_body} />
            <Row label="License status" value={verification.license_status} />
            <Row label="Registration number" value={verification.reg_number ?? "—"} />
            <Row
              label="Authorised to represent minors"
              value={
                verification.minors_authorised
                  ? `Yes (until ${verification.minors_authorised_until})`
                  : "No"
              }
            />
            <Row label="Source" value={`${verification.license_source} (checked ${verification.checked_on})`} />
            {verification.bio && <Row label="Notes" value={verification.bio} />}
          </dl>
          <p className="mt-4 text-xs text-muted">
            Informational only. This site does not list player profiles and
            does not facilitate contact with anyone under 18, regardless of
            an agent&apos;s minors-authorisation status.
          </p>
        </div>
      ) : (
        <div
          className="mt-5 rounded-2xl border border-line bg-surface p-10 text-center"
          style={{ background: "linear-gradient(180deg, #FFFFFF, #F5FAF7)" }}
        >
          <div className="mx-auto mb-4.5 flex h-13 w-13 items-center justify-center rounded-2xl bg-accent-tint">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-dark)" strokeWidth="1.8">
              <rect x="5" y="10" width="14" height="9" rx="2" />
              <path d="M8 10V7a4 4 0 018 0v3" />
            </svg>
          </div>
          <h2 className="mb-2 font-display text-lg font-extrabold">
            License status, registration number and minors-authorisation are
            available to subscribers
          </h2>
          <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-muted">
            Subscribing unlocks this agent&rsquo;s full verification record,
            re-checked against their national federation&rsquo;s public
            register.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/pricing" className="rounded-[10px] bg-accent px-5.5 py-3 text-[14.5px] font-bold text-[#06241a]">
              See institutional pricing
            </Link>
            <Link href="/pricing" className="rounded-[10px] bg-accent-tint px-5.5 py-3 text-[14.5px] font-bold text-accent-dark">
              See family pricing
            </Link>
          </div>
        </div>
      )}

      {/* clubs dealt with — not tracked yet, shown as an honest empty state */}
      <div className="mt-5 rounded-2xl border border-line bg-surface p-6.5">
        <h3 className="mb-1 text-[15.5px] font-extrabold">Clubs this agent deals with</h3>
        <p className="text-sm leading-relaxed text-muted">
          Club placement data isn&rsquo;t tracked yet — it&rsquo;s coming in
          a future update.
        </p>
      </div>

      {agent.agency && (
        <div className="mt-5 rounded-2xl border border-line bg-surface p-6.5">
          <h3 className="mb-2.5 text-[15.5px] font-extrabold">About {agent.agency}</h3>
          <p className="max-w-2xl text-sm leading-relaxed text-muted">
            {agent.website ? (
              <>
                Find out more at{" "}
                <a href={agent.website} className="font-semibold text-accent-dark" target="_blank" rel="noreferrer">
                  {agent.website}
                </a>
                .
              </>
            ) : (
              "No further agency details are listed yet."
            )}
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-col items-start justify-between gap-3 rounded-2xl bg-accent-tint px-6 py-4 text-[12.5px] leading-relaxed text-accent-dark sm:flex-row sm:items-center">
        <span className="max-w-2xl">
          This directory lists agents only. It does not list player profiles
          and does not facilitate contact with anyone under 18.
        </span>
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="mb-1 text-xs text-muted">{label}</div>
      <div className="text-[13.5px] font-bold">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}
