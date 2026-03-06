"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { StudyTimer } from "@/components/StudyTimer";
import { AuthNav } from "@/components/AuthNav";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="hidden md:flex w-64 shrink-0 border-r border-[var(--card-border)] bg-[var(--card)] flex-col">
      <div className="p-5 border-b border-[var(--card-border)]">
        <Link href="/" className="block text-xl font-semibold text-[var(--foreground)]">
          BiteSized
        </Link>
        <p className="text-xs text-[var(--muted)] mt-1">
          Study packs from your content
        </p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--card)] ${
                isActive
                  ? "bg-white/10 text-[var(--foreground)]"
                  : "text-[var(--foreground)] hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-[var(--card-border)] space-y-3">
        <AuthNav />
        <StudyTimer />
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--card)]"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>
    </aside>
  );
}
