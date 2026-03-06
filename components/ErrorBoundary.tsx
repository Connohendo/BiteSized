"use client";

import React from "react";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            Something went wrong
          </h2>
          <p className="text-[var(--muted)] mb-6">
            An unexpected error occurred. You can try again or return to the dashboard.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg border border-[var(--card-border)] text-[var(--foreground)] text-sm font-medium hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
