"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const directoryItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="8" rx="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" />
        <rect x="13" y="13" width="8" height="8" rx="2" />
      </svg>
    ),
  },
  {
    href: "/agents",
    label: "Browse agents",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M8 4v16" />
      </svg>
    ),
  },
  {
    href: "/pricing",
    label: "Pricing",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2l2.6 6.6 7.1.5-5.6 4.4 2 6.9L12 16.9 5.9 20.4l2-6.9L2.3 9.1l7.1-.5L12 2z" />
      </svg>
    ),
  },
];

const accountItems: NavItem[] = [
  {
    href: "/account",
    label: "My account",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
      </svg>
    ),
  },
];

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active =
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-2.5 rounded-[10px] px-3.5 py-2.5 text-sm font-semibold ${
        active
          ? "bg-white/12 text-white"
          : "text-[#CFE6D9] hover:bg-white/8"
      }`}
    >
      {item.icon}
      {item.label}
    </Link>
  );
}

export default function SidebarNav() {
  return (
    <>
      <div className="relative px-2.5 pb-2 pt-3.5 text-[11px] font-bold tracking-wider text-[#6E9C85]">
        DIRECTORY
      </div>
      <nav className="relative flex flex-col gap-0.5">
        {directoryItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
      <div className="relative px-2.5 pb-2 pt-5.5 text-[11px] font-bold tracking-wider text-[#6E9C85]">
        ACCOUNT
      </div>
      <nav className="relative flex flex-col gap-0.5">
        {accountItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>
    </>
  );
}
