import Link from "next/link";

const tiers = [
  {
    id: "family_readonly",
    name: "Players and Family",
    audience: "For players and parents/guardians",
    blurb:
      "Read-only verified data on any agent — license status, minors-authorisation, FA registration number. No messaging or contact features with agents, for anyone of any age.",
    account: "Held by a parent or guardian when the player is under 18.",
  },
  {
    id: "institutional_basic",
    name: "Institutional",
    audience: "For clubs, academies and agencies",
    blurb:
      "Full search and filtering by license status, region, specialism and minors-authorisation across all listed agents.",
    account: "Organisation account.",
  },
  {
    id: "institutional_pro",
    name: "Institutional + export",
    audience: "For clubs, academies and agencies",
    blurb: "Everything in Institutional, plus CSV export and API access.",
    account: "Organisation account.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="flex items-center justify-between border-b border-line bg-surface px-14 py-5.5">
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="#0B2B20" strokeWidth="1.6" />
            <path d="M12 7l3.5 2.5-1.3 4.1h-4.4L8.5 9.5 12 7z" fill="#0B2B20" />
          </svg>
          <span className="font-display text-[17px] font-extrabold">
            Agent<span className="text-accent-dark">Index</span>
          </span>
        </Link>
        <Link href="/agents" className="text-[14.5px] font-semibold text-muted hover:text-ink">
          Browse the directory
        </Link>
      </div>

      <div className="mx-auto max-w-5xl px-10 py-12">
        <h1 className="font-display text-2xl font-extrabold">Subscription tiers</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Pricing is not yet set — this page lists what each tier includes.
          Billing (Stripe) isn&apos;t wired up yet, so signing up below
          creates an account only, no payment is taken.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {tiers.map((tier) => (
            <div key={tier.id} className="rounded-2xl border border-line bg-surface p-6.5">
              <h2 className="font-display font-extrabold">{tier.name}</h2>
              <p className="mt-1 text-xs text-muted">{tier.audience}</p>
              <p className="mt-4 text-sm leading-relaxed text-ink">{tier.blurb}</p>
              <p className="mt-4 text-xs text-muted">{tier.account}</p>
            </div>
          ))}
        </div>
        <Link
          href="/login"
          className="mt-8 inline-block rounded-[10px] bg-accent px-6 py-3 text-[14.5px] font-bold text-[#06241a]"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
