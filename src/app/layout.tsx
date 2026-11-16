import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

export const metadata: Metadata = {
  title: "Football agent directory (working name)",
  description:
    "Verified FA/FIFA football agent data for clubs, agencies and families.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user ?? null;

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        <header className="border-b border-neutral-200">
          <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
            <Link href="/" className="font-semibold">
              Football agent directory
              <span className="ml-2 text-xs font-normal text-neutral-500">
                (working name)
              </span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/agents">Browse agents</Link>
              <Link href="/pricing">Pricing</Link>
              {user ? (
                <>
                  <Link href="/account">Account</Link>
                  <SignOutButton />
                </>
              ) : (
                <Link href="/login">Sign in</Link>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-neutral-200 py-6">
          <div className="mx-auto max-w-5xl px-6 text-xs text-neutral-500">
            Lists agents by their published FA/FIFA license status. Does not
            endorse any agent and does not negotiate on anyone&apos;s behalf.
            Does not list player profiles and does not facilitate contact
            with anyone under 18. Operated by User Companies Ltd, England
            &amp; Wales company no. 10069026.
          </div>
        </footer>
      </body>
    </html>
  );
}
