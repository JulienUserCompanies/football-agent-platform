import Link from "next/link";

const tiers = [
  {
    id: "family_readonly",
    name: "Family",
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
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Subscription tiers</h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-600">
        Pricing is not yet set — this page lists what each tier includes.
        Billing (Stripe) isn&apos;t wired up yet, so sign-up below creates an
        account only, no payment is taken.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className="rounded-lg border border-neutral-200 p-6"
          >
            <h2 className="font-semibold">{tier.name}</h2>
            <p className="mt-1 text-xs text-neutral-500">{tier.audience}</p>
            <p className="mt-4 text-sm text-neutral-700">{tier.blurb}</p>
            <p className="mt-4 text-xs text-neutral-500">{tier.account}</p>
          </div>
        ))}
      </div>
      <Link
        href="/login"
        className="mt-8 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
      >
        Create an account
      </Link>
    </div>
  );
}
