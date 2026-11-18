"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

type ParsedRow = Record<string, string>;

const EXPECTED_COLUMNS = [
  "name",
  "agency",
  "country",
  "regions",
  "specialisms",
  "website",
  "license_body",
  "license_status",
  "reg_number",
  "license_source",
  "checked_on",
  "minors_authorised",
  "minors_authorised_until",
  "bio",
  "featured",
];

const REQUIRED_COLUMNS = ["name", "country", "license_body", "license_status", "license_source", "checked_on"];

const CHUNK_SIZE = 500;

function normalizeHeader(h: string) {
  return h.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

// Dates can arrive as a real Date (xlsx with cellDates:true), an Excel
// serial number (older files, or CSV content a spreadsheet app rewrote
// with implicit date typing), or plain text already in a sane format.
function toIsoDate(value: unknown): string {
  if (value == null || value === "") return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number") {
    // Excel serial date: days since 1899-12-30 (accounts for the
    // historical leap-year bug baked into that epoch).
    const epoch = Date.UTC(1899, 11, 30);
    const ms = epoch + Math.round(value) * 86400000;
    return new Date(ms).toISOString().slice(0, 10);
  }
  const s = String(value).trim();
  // Numeric-looking string that slipped through as text (e.g. "46240.04").
  if (/^\d+(\.\d+)?$/.test(s)) {
    const epoch = Date.UTC(1899, 11, 30);
    const ms = epoch + Math.round(parseFloat(s)) * 86400000;
    return new Date(ms).toISOString().slice(0, 10);
  }
  // dd/mm/yyyy -> yyyy-mm-dd
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return s;
}

export default function AdminImportPage() {
  const [passcode, setPasscode] = useState("");
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [missingRequired, setMissingRequired] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "parsing" | "ready" | "importing" | "done" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [progress, setProgress] = useState<{ inserted: number; skipped: number; total: number } | null>(null);

  async function handleFile(file: File) {
    setStatus("parsing");
    setMessage("");
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      // cellDates: true makes XLSX hand back real Date objects for date
      // cells instead of raw Excel serial numbers (e.g. 46240.0417) when
      // the file has passed through Excel/Numbers as .xlsx — otherwise
      // date columns like checked_on come through as that serial number.
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

      if (json.length === 0) {
        setStatus("error");
        setMessage("That sheet has no rows.");
        return;
      }

      const rawHeaders = Object.keys(json[0]);
      const headerMap = new Map(rawHeaders.map((h) => [h, normalizeHeader(h)]));
      const normalizedHeaders = [...headerMap.values()];

      const missing = REQUIRED_COLUMNS.filter((c) => !normalizedHeaders.includes(c));
      setMissingRequired(missing);
      setHeaders(normalizedHeaders.filter((h) => EXPECTED_COLUMNS.includes(h)));

      const DATE_COLUMNS = new Set(["checked_on", "minors_authorised_until"]);

      const normalizedRows: ParsedRow[] = json.map((r) => {
        const out: ParsedRow = {};
        for (const [raw, norm] of headerMap.entries()) {
          if (!EXPECTED_COLUMNS.includes(norm)) continue;
          const value = r[raw];
          if (DATE_COLUMNS.has(norm)) {
            out[norm] = toIsoDate(value);
          } else {
            out[norm] = String(value ?? "").trim();
          }
        }
        return out;
      });

      setRows(normalizedRows);
      setStatus(missing.length ? "error" : "ready");
      if (missing.length) {
        setMessage(`Missing required column(s): ${missing.join(", ")}`);
      }
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Couldn't parse that file.");
    }
  }

  async function runImport() {
    if (!passcode) {
      setMessage("Enter the admin passcode first.");
      return;
    }
    setStatus("importing");
    setMessage("");
    let totalInserted = 0;
    let totalSkipped = 0;
    const chunks: ParsedRow[][] = [];
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      chunks.push(rows.slice(i, i + CHUNK_SIZE));
    }

    for (let i = 0; i < chunks.length; i++) {
      setProgress({ inserted: totalInserted, skipped: totalSkipped, total: rows.length });
      try {
        const res = await fetch("/api/admin/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passcode, rows: chunks[i] }),
        });
        const json = await res.json();
        if (!res.ok) {
          setStatus("error");
          setMessage(`Stopped at chunk ${i + 1}/${chunks.length}: ${json.error ?? "unknown error"}`);
          setProgress({ inserted: totalInserted, skipped: totalSkipped, total: rows.length });
          return;
        }
        totalInserted += json.inserted ?? 0;
        totalSkipped += json.skipped ?? 0;
      } catch (e) {
        setStatus("error");
        setMessage(`Network error on chunk ${i + 1}/${chunks.length}: ${e instanceof Error ? e.message : "unknown"}`);
        return;
      }
    }

    setProgress({ inserted: totalInserted, skipped: totalSkipped, total: rows.length });
    setStatus("done");
    setMessage(`Done. Inserted ${totalInserted}, skipped ${totalSkipped} (already existed — same slug).`);
  }

  return (
    <div className="mx-auto max-w-3xl px-10 py-10">
      <h1 className="font-display text-2xl font-extrabold">Bulk import agents</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Upload a CSV or Excel (.xlsx) file of agents to add to the directory.
        This is an internal tool — anyone with the file and the passcode can
        write to the live database, so don&rsquo;t share this link.
      </p>

      <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">Expected columns</h2>
        <div className="flex flex-wrap gap-1.5 text-[12px]">
          {EXPECTED_COLUMNS.map((c) => (
            <span
              key={c}
              className={`rounded-full px-2.5 py-1 font-semibold ${
                REQUIRED_COLUMNS.includes(c)
                  ? "bg-accent-tint text-accent-dark"
                  : "bg-[#F0F3F1] text-muted"
              }`}
            >
              {c}
              {REQUIRED_COLUMNS.includes(c) ? " *" : ""}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          * required. <code>regions</code> and <code>specialisms</code> can be
          comma-separated within a cell (e.g. &ldquo;North West, Non-League&rdquo;).
          <code>minors_authorised</code> and <code>featured</code> are
          true/false. Header names are matched case-insensitively and with
          spaces/dashes treated as underscores.
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-line bg-surface p-6">
        <label className="mb-2 block text-sm font-bold">File</label>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          className="block w-full text-sm"
        />
        {fileName && <p className="mt-2 text-xs text-muted">{fileName}</p>}

        {status === "parsing" && <p className="mt-3 text-sm text-muted">Parsing…</p>}

        {headers.length > 0 && (
          <p className="mt-3 text-sm">
            Found <strong>{rows.length}</strong> row{rows.length === 1 ? "" : "s"} with columns:{" "}
            {headers.join(", ")}
          </p>
        )}

        {missingRequired.length > 0 && (
          <p className="mt-2 text-sm font-semibold text-red-600">
            Missing required column(s): {missingRequired.join(", ")}
          </p>
        )}

        <label className="mb-2 mt-5 block text-sm font-bold">Admin passcode</label>
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Passcode"
          className="w-full max-w-xs rounded-[10px] border border-line bg-surface px-3 py-2.5 text-[13.5px] outline-none focus:border-accent"
        />

        <div className="mt-5">
          <button
            onClick={runImport}
            disabled={status !== "ready" && status !== "done" && status !== "error"}
            className="rounded-[10px] bg-accent px-6 py-3 text-[14.5px] font-bold text-[#06241a] disabled:opacity-40"
          >
            {status === "importing" ? "Importing…" : "Import"}
          </button>
        </div>

        {progress && (
          <p className="mt-4 text-sm text-muted">
            {progress.inserted + progress.skipped} / {progress.total} processed —{" "}
            {progress.inserted} inserted, {progress.skipped} skipped
          </p>
        )}

        {message && (
          <p className={`mt-3 text-sm font-semibold ${status === "error" ? "text-red-600" : "text-accent-dark"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
