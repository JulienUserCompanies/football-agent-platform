import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AgentsPage() {
  const supabase = await createClient();
  const { data: agents } = await supabase
    .from("agents")
    .select("slug, name, agency, regions, specialisms")
    .order("name");

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Browse agents</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Free to browse. License status and minors-authorisation need a
        subscription to view.
      </p>
      <ul className="mt-8 divide-y divide-neutral-200">
        {agents?.map((agent) => (
          <li key={agent.slug} className="py-4">
            <Link
              href={`/agents/${agent.slug}`}
              className="font-medium hover:underline"
            >
              {agent.name}
            </Link>
            <div className="mt-1 text-sm text-neutral-600">
              {agent.agency ?? "Independent"} · {agent.regions?.join(", ")} ·{" "}
              {agent.specialisms?.join(", ")}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
