import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Admin bulk-import endpoint. Auth is a shared passcode (set in the
// `app_settings` table, checked inside the `import_agents` Postgres
// function via SECURITY DEFINER) rather than a user account, since this
// app has no admin-role concept yet. The passcode never leaves the
// server except as a 401 on mismatch — it's forwarded straight to the
// RPC call and not logged.
export async function POST(request: Request) {
  let body: { passcode?: string; rows?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { passcode, rows } = body;

  if (!passcode || typeof passcode !== "string") {
    return NextResponse.json({ error: "Missing passcode" }, { status: 400 });
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows to import" }, { status: 400 });
  }
  if (rows.length > 2000) {
    return NextResponse.json(
      { error: "Max 2000 rows per import — split the file and upload in parts" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("import_agents", {
    p_passcode: passcode,
    p_rows: rows,
  });

  if (error) {
    const invalidPasscode = error.message?.toLowerCase().includes("invalid passcode");
    return NextResponse.json(
      { error: invalidPasscode ? "Incorrect passcode" : error.message },
      { status: invalidPasscode ? 401 : 500 }
    );
  }

  const result = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({
    inserted: result?.inserted_count ?? 0,
    skipped: result?.skipped_count ?? 0,
  });
}
