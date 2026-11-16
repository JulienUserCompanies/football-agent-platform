import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import SidebarNav from "@/components/app-shell/SidebarNav";

export default async function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user ?? null;

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "—";

  return (
    <div className="flex min-h-screen">
      <aside className="relative flex w-63 flex-shrink-0 flex-col overflow-hidden bg-sidebar px-4.5 py-6.5">
        <div
          className="pointer-events-none absolute -bottom-15 -right-15 h-55 w-55 rotate-[18deg] rounded-[28px] bg-accent opacity-14"
          aria-hidden="true"
        />
        <Link href="/" className="relative mb-2.5 flex items-center gap-2.5 px-2 pb-5">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.6" />
            <path d="M12 7l3.5 2.5-1.3 4.1h-4.4L8.5 9.5 12 7z" fill="#fff" />
          </svg>
          <div className="font-display text-lg font-extrabold leading-tight text-white">
            Agent<span className="text-accent">Index</span>
            <div className="mt-0.5 text-[10px] font-semibold tracking-wider text-[#9FC2AF]">
              FOOTBALL AGENT DIRECTORY
            </div>
          </div>
        </Link>

        <SidebarNav />

        <div className="relative mt-auto rounded-[14px] border border-white/14 bg-white/8 p-4 text-[#E6F3EC]">
          <div className="mb-1 text-[13.5px] font-bold">For clubs &amp; agencies</div>
          <div className="mb-3 text-xs leading-relaxed text-[#AFCCBD]">
            Filterable, exportable access to every FA-registered agent.
          </div>
          <Link
            href="/pricing"
            className="block rounded-[9px] bg-accent px-3 py-2 text-center text-[13px] font-bold text-[#06241a]"
          >
            View institutional access
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1 bg-bg">
        <div className="flex items-center justify-between border-b border-line bg-surface px-10 py-4.5">
          <div className="flex gap-7">
            <Link href="/agents" className="border-b-2 border-transparent pb-1.5 text-[14.5px] font-semibold text-muted hover:text-ink">
              Directory
            </Link>
            <Link href="/pricing" className="border-b-2 border-transparent pb-1.5 text-[14.5px] font-semibold text-muted hover:text-ink">
              Pricing
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-[13px] font-bold text-white">
                  {initials}
                </div>
                <SignOutButton />
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-[9px] bg-accent px-4 py-2 text-[13.5px] font-bold text-[#06241a]"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
        <main>{children}</main>
      </div>
    </div>
  );
}
