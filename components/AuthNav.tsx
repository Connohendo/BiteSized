"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SessionUser = { id: string; email?: string; name?: string } | null;

export function AuthNav() {
  const [user, setUser] = useState<SessionUser>(undefined as unknown as SessionUser);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));
  }, []);

  if (user === undefined) {
    return (
      <span className="text-sm text-[var(--muted)]">…</span>
    );
  }

  if (user) {
    return (
      <span className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-[var(--muted)] truncate max-w-[140px]" title={user.email ?? undefined}>
          {user.email ?? user.name ?? "Signed in"}
        </span>
        <form action="/auth/signout" method="POST" className="inline">
          <button
            type="submit"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded"
          >
            Sign out
          </button>
        </form>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <Link
        href="/auth/login"
        className="text-sm text-[var(--accent)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded"
      >
        Sign in
      </Link>
      <span className="text-[var(--muted)]">·</span>
      <Link
        href="/auth/signup"
        className="text-sm text-[var(--accent)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded"
      >
        Sign up
      </Link>
    </span>
  );
}
