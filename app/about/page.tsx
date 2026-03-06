"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-[var(--muted)] mb-1">
          <Link href="/" className="hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded">
            ← Dashboard
          </Link>
        </p>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          About BiteSized
        </h1>
        <p className="text-[var(--muted)] mt-1">
          Study packs from your content, with a built-in focus timer.
        </p>
      </div>

      <section className="space-y-4 mb-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          What BiteSized does
        </h2>
        <p className="text-sm leading-relaxed text-[var(--foreground)]">
          BiteSized turns any content into a study pack. Paste text, add a link, or upload a file—including article URLs and YouTube videos—and get a full set of study materials in one go.
        </p>
        <p className="text-sm leading-relaxed text-[var(--foreground)]">
          Each study pack includes:
        </p>
        <ul className="list-disc list-inside text-sm leading-relaxed text-[var(--foreground)] space-y-1 ml-2">
          <li>Summary and key points</li>
          <li>Key terms</li>
          <li>Flashcards</li>
          <li>Quiz questions</li>
          <li>Outline and mind map</li>
          <li>Q&A over the document</li>
        </ul>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          You can compare two documents for a side-by-side summary and merged bullet points. Export to Anki CSV, copy or download as Markdown, or print and save as PDF.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          Focus timer &amp; Pomodoro
        </h2>
        <p className="text-sm leading-relaxed text-[var(--foreground)]">
          The <strong>Focus</strong> timer in the sidebar is a Pomodoro-style timer: <strong>25-minute focus sessions</strong> and <strong>5-minute breaks</strong>. When a focus period ends, the timer automatically switches to a 5-minute break (and back to focus when the break ends). Use Start/Pause and Reset as needed.
        </p>
        <p className="text-sm leading-relaxed text-[var(--foreground)]">
          Time-boxing keeps study sessions focused and breaks reduce fatigue. The timer is always available in the sidebar—and in the mobile menu—so you can run Pomodoros while using your study packs.
        </p>
      </section>

      <p className="text-sm text-[var(--muted)] mb-8">
        <Link href="/" className="text-[var(--accent)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded">
          Try it on the Dashboard →
        </Link>
      </p>

      <footer className="mt-12 pt-8 border-t border-[var(--card-border)] text-center text-sm text-[var(--muted)] no-print">
        BiteSized · <Link href="/about" className="hover:text-[var(--foreground)]">About</Link> · <Link href="/terms" className="hover:text-[var(--foreground)]">Terms</Link> · <Link href="/privacy" className="hover:text-[var(--foreground)]">Privacy</Link> · <a href="#" className="hover:text-[var(--foreground)]">Contact</a>
      </footer>
    </div>
  );
}
