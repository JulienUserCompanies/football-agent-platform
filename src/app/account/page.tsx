import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type, org_name")
    .eq("id", userData.user.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("tier, status, current_period_end")
    .eq("profile_id", userData.user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Account</h1>
      <dl className="mt-6 space-y-3 text-sm">
        <Row label="Email" value={userData.user.email ?? "—"} />
        <Row
          label="Account type"
          value={profile?.account_type ?? "unknown"}
        />
        {profile?.org_name && (
          <Row label="Organisation" value={profile.org_name} />
        )}
        <Row
          label="Subscription"
          value={
            subscription
              ? `${subscription.tier} — ${subscription.status}`
              : "No subscription yet (billing isn't wired up — gated agent detail won't be visible until one exists)"
          }
        />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-neutral-100 pb-3">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
