import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type, org_name, created_at")
    .eq("id", userData.user.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("tier, status, current_period_end")
    .eq("profile_id", userData.user.id)
    .maybeSingle();

  const initials = userData.user.email
    ? userData.user.email.slice(0, 2).toUpperCase()
    : "—";

  const tierLabel: Record<string, string> = {
    family_readonly: "Family — read-only access",
    institutional_basic: "Institutional",
    institutional_pro: "Institutional + export",
  };

  return (
    <div className="mx-auto max-w-5xl px-10 py-9">
      <div className="mb-1 text-[13px] font-semibold text-muted">
        Home / <span className="text-ink">Your account</span>
      </div>
      <h1 className="font-display text-2xl font-extrabold">Your account</h1>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-6.5">
          <div className="mb-5 flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-[14px] font-bold text-white">
              {initials}
            </div>
            <div>
              <div className="text-[15px] font-bold">{userData.user.email}</div>
              <span className="mt-1 inline-block rounded-full bg-accent-tint px-2.5 py-0.5 text-[11px] font-semibold text-accent-dark">
                {profile?.account_type === "institutional"
                  ? "Institutional"
                  : "Family · read-only"}
              </span>
            </div>
          </div>
          <dl className="space-y-3 text-sm">
            {profile?.org_name && <Row label="Organisation" value={profile.org_name} />}
            {profile?.account_type === "family" && (
              <Row
                label="Held on behalf of"
                value="A player under 18 (parent/guardian account)"
              />
            )}
            {profile?.created_at && (
              <Row
                label="Member since"
                value={new Date(profile.created_at).toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })}
              />
            )}
          </dl>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6.5">
          <h2 className="mb-4 text-[15px] font-bold">Subscription</h2>
          {subscription ? (
            <>
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-accent-tint px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent-dark">
                  {subscription.status}
                </span>
              </div>
              <dl className="space-y-3 text-sm">
                <Row label="Plan" value={tierLabel[subscription.tier] ?? subscription.tier} />
                {subscription.current_period_end && (
                  <Row
                    label="Renews"
                    value={new Date(subscription.current_period_end).toLocaleDateString("en-GB")}
                  />
                )}
              </dl>
              <div className="mt-5 flex gap-3">
                <button className="rounded-[10px] border border-line px-4 py-2 text-[13.5px] font-semibold">
                  Manage billing
                </button>
                <button className="rounded-[10px] border border-line px-4 py-2 text-[13.5px] font-semibold text-muted">
                  Cancel subscription
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">
              No subscription yet — billing isn&apos;t wired up. Licence
              status and minors-authorisation won&apos;t be visible on agent
              pages until one exists.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-[14px] bg-accent-tint px-6 py-4 text-[12.5px] leading-relaxed text-accent-dark">
        {profile?.account_type === "family"
          ? "This account is for a parent or guardian checking an agent on a player's behalf. No tier includes messaging or introductions — it's a verification lookup, not a marketplace."
          : "Institutional access is a verification lookup, not a marketplace — it does not facilitate contact with anyone under 18."}
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface p-6.5">
        <h2 className="mb-4 text-[15px] font-bold">Saved agents</h2>
        <p className="text-sm text-muted">
          You haven&apos;t saved any agents yet — saving isn&apos;t wired up
          yet. Browse the{" "}
          <Link href="/agents" className="font-semibold text-accent-dark">
            directory
          </Link>{" "}
          to get started.
        </p>
      </div>
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
