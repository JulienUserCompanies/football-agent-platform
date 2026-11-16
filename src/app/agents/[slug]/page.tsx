import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AgentDetailPage({
  params,
}: PageProps<"/agents/[slug]">) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: agent } = await supabase
    .from("agents")
    .select("id, slug, name, agency, regions, specialisms, website")
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
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/agents" className="text-sm text-neutral-500">
        ← All agents
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">{agent.name}</h1>
      <p className="mt-1 text-neutral-600">
        {agent.agency ?? "Independent"} · {agent.regions?.join(", ")}
      </p>
      <p className="mt-1 text-sm text-neutral-500">
        Specialisms: {agent.specialisms?.join(", ")}
      </p>

      <div className="mt-8 rounded-lg border border-neutral-200 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Verification
        </h2>

        {verification ? (
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="License body" value={verification.license_body} />
            <Row label="License status" value={verification.license_status} />
            <Row
              label="FA registration number"
              value={verification.reg_number ?? "—"}
            />
            <Row
              label="Authorised to represent minors"
              value={
                verification.minors_authorised
                  ? `Yes (until ${verification.minors_authorised_until})`
                  : "No"
              }
            />
            <Row
              label="Source"
              value={`${verification.license_source} (checked ${verification.checked_on})`}
            />
            {verification.bio && <Row label="Notes" value={verification.bio} />}
            <p className="pt-2 text-xs text-neutral-500">
              Informational only. This site does not list player profiles
              and does not facilitate contact with anyone under 18,
              regardless of an agent&apos;s minors-authorisation status.
            </p>
          </dl>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-neutral-600">
              License status, FA registration number and
              minors-authorisation are available to subscribers.
            </p>
            <Link
              href="/pricing"
              className="mt-3 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
            >
              See subscription options
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
