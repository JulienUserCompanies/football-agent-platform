import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("agents")
    .select("*", { count: "exact", head: true });

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Find a verified football agent
      </h1>
      <p className="mt-4 max-w-2xl text-neutral-600">
        {count ?? "—"} agents sourced from the FA&apos;s public register of
        licensed football agents. Free to browse. Subscribe to see license
        status, minors-authorisation and full verification detail —
        institutional access for clubs and agencies, read-only access for
        players and families.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/agents"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          Browse agents
        </Link>
        <Link
          href="/pricing"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium"
        >
          See pricing
        </Link>
      </div>
    </div>
  );
}
