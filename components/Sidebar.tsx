"use client";

import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/history", label: "History" },
];

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="w-64 shrink-0 border-r border-[var(--card-border)] bg-[var(--card)] flex flex-col">
      <div className="p-5 border-b border-[var(--card-border)]">
        <Link href="/" className="text-xl font-semibold text-[var(--foreground)]">
          BiteSized
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--foreground)] hover:bg-white/5 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-[var(--card-border)]">
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)] transition-colors"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>
    </aside>
  );
}
