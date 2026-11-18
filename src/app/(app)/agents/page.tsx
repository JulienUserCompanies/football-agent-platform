import { createClient } from "@/lib/supabase/server";
import AgentsTable from "@/components/AgentsTable";

export default async function AgentsPage() {
  const supabase = await createClient();
  const { data: agents } = await supabase
    .from("agents")
    .select("slug, name, agency, regions, specialisms, country")
    .order("name");

  const rows = agents ?? [];

  return (
    <div className="mx-auto max-w-5xl px-10 py-9">
      <div className="mb-1 text-[13px] font-semibold text-muted">
        Home / <span className="text-ink">Directory</span>
      </div>
      <h1 className="font-display text-2xl font-extrabold">Browse agents</h1>
      <p className="mt-2 text-sm text-muted">
        Free to browse, {rows.length} agents listed. Licence status and
        minors-authorisation need a subscription to view.
      </p>

      <AgentsTable agents={rows} />
    </div>
  );
}
