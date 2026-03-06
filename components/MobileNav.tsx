"use client";

import { useState } from "react";
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

export function MobileNav() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="md:hidden shrink-0 flex items-center justify-between gap-4 px-4 py-3 border-b border-[var(--card-border)] bg-[var(--card)]">
        <Link href="/" className="text-lg font-semibold text-[var(--foreground)]">
          BiteSized
        </Link>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="p-2 rounded-lg text-[var(--foreground)] hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--card)]"
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {drawerOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="md:hidden fixed inset-0 z-[90] bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className="md:hidden fixed top-0 left-0 z-[91] w-[280px] max-w-[85vw] h-full flex flex-col bg-[var(--card)] border-r border-[var(--card-border)] shadow-xl"
            role="dialog"
            aria-label="Navigation menu"
          >
            <div className="p-5 border-b border-[var(--card-border)] flex items-center justify-between">
              <div>
                <Link href="/" className="block text-xl font-semibold text-[var(--foreground)]" onClick={() => setDrawerOpen(false)}>
                  BiteSized
                </Link>
                <p className="text-xs text-[var(--muted)] mt-1">Study packs from your content</p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-lg text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                aria-label="Close menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-0.5 overflow-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--card)] ${
                      isActive ? "bg-white/10 text-[var(--foreground)]" : "text-[var(--foreground)] hover:bg-white/5"
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
        </>
      )}
    </>
  );
}
