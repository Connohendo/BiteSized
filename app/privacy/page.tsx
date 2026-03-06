import Link from "next/link";

export const metadata = {
  title: "Privacy Policy – BiteSized",
  description: "Privacy Policy for BiteSized. How we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-[var(--muted)] mb-1">
          <Link href="/" className="hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded">
            ← Dashboard
          </Link>
        </p>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Privacy Policy
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Last updated: March 2, 2025
        </p>
      </div>

      <section className="space-y-4 mb-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          1. Introduction and scope
        </h2>
        <p className="text-sm leading-relaxed text-[var(--foreground)]">
          This Privacy Policy describes how BiteSized (“we,” “us”) collects, uses, and shares information when you use our web application. The Service is available globally; by using it from any country you accept this policy. Where your local law requires stricter or additional rights, we respect those to the extent applicable.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          2. Information we collect
        </h2>
        <p className="text-sm leading-relaxed text-[var(--foreground)]">
          (a) <strong>Content you submit:</strong> Text, uploaded files, and URLs (including article and YouTube links) that you paste or submit for processing. (b) <strong>Usage information:</strong> That you use the Service (e.g., requests to our API); we do not persistently store your submitted content on our servers after processing. (c) <strong>Device/browser information:</strong> We may receive information such as IP address, user-agent, or referring URL in server logs for security and operations; we do not currently use third-party analytics. (d) <strong>Local storage:</strong> Theme preference, study history, and SRS data are stored only in your browser (localStorage), not on our servers.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          3. How we use your information
        </h2>
        <p className="text-sm leading-relaxed text-[var(--foreground)]">
          We use your information to provide the Service (process content, generate study materials, compare documents, Q&A, and explain features); to send content to third-party service providers (e.g., OpenAI) as necessary to operate the Service; to improve the Service and fix issues; and to comply with applicable law.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          4. Third-party sharing
        </h2>
        <p className="text-sm leading-relaxed text-[var(--foreground)]">
          We share content with OpenAI (or other AI providers we use) to generate summaries, flashcards, and other materials. We may fetch article content and YouTube transcripts from third-party sources when you provide URLs. We do not sell your personal information. We may disclose information if required by law or to protect our rights, safety, or the rights and safety of others.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          5. Retention
        </h2>
        <p className="text-sm leading-relaxed text-[var(--foreground)]">
          We do not retain your submitted content or generated results on our servers after the response is sent. History and similar data are stored only in your browser (localStorage) and are under your control (e.g., you can clear site data). Server logs, if any, are retained for a limited period (e.g., 30–90 days) for security and operations.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          6. Cookies and local storage
        </h2>
        <p className="text-sm leading-relaxed text-[var(--foreground)]">
          We use localStorage for theme, history, and SRS data—strictly necessary for the functionality you request. We do not use cookies for tracking or advertising; if we use cookies in the future (e.g., for sessions or analytics), we will update this policy.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          7. Your rights
        </h2>
        <p className="text-sm leading-relaxed text-[var(--foreground)]">
          We respect rights under applicable data protection laws worldwide. <strong>Access:</strong> You can request what we hold; note that we generally do not store your content after processing. <strong>Deletion:</strong> For client-stored data, clear your browser data; for any server-side data, contact us to request deletion. <strong>Portability:</strong> To the extent we hold data, you can request a copy. <strong>GDPR (EU/EEA/UK):</strong> Our legal basis includes performance of contract and legitimate interest; you have the right to access, rectify, erase, restrict, object, and data portability, and to complain to a supervisory authority. <strong>CCPA/CPRA (California):</strong> We do not sell personal information; you have the right to know, delete, and correct, and the right to non-discrimination; contact us to submit requests. <strong>Other regimes:</strong> Where your country’s law grants additional rights (e.g., Brazil LGPD, Canada PIPEDA, Australia Privacy Act), we will honour them to the extent applicable; contact us to exercise your rights.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          8. Children
        </h2>
        <p className="text-sm leading-relaxed text-[var(--foreground)]">
          The Service is not directed at children under 13 (or 16 in some jurisdictions). We do not knowingly collect personal information from children. If you believe we have collected such information, contact us to request deletion.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          9. International transfers
        </h2>
        <p className="text-sm leading-relaxed text-[var(--foreground)]">
          The Service is global; users may access it from any country. Data may be processed in the United States (or our actual hosting location). Where your law restricts international transfers (e.g., GDPR Articles 44–50), we implement appropriate safeguards (e.g., adequacy decision, Standard Contractual Clauses, or equivalent) so that transfers are lawful. We do not sell or rent your data to third parties.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          10. Security
        </h2>
        <p className="text-sm leading-relaxed text-[var(--foreground)]">
          We take reasonable measures to protect information. No method of transmission or storage is completely secure; you use the Service at your own risk.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          11. Changes to this policy
        </h2>
        <p className="text-sm leading-relaxed text-[var(--foreground)]">
          We may update this policy. We will post the new version and update the “Last updated” date. Your continued use after the effective date constitutes acceptance. For material changes we may provide additional notice.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          12. Contact
        </h2>
        <p className="text-sm leading-relaxed text-[var(--foreground)]">
          For privacy requests and questions, contact BiteSized via the Contact link in the footer or at the contact address provided on the Service. If required by law, we will provide details for a data protection officer or EU representative.
        </p>
      </section>

      <footer className="mt-12 pt-8 border-t border-[var(--card-border)] text-center text-sm text-[var(--muted)] no-print">
        BiteSized · <Link href="/about" className="hover:text-[var(--foreground)]">About</Link> · <Link href="/terms" className="hover:text-[var(--foreground)]">Terms</Link> · <Link href="/privacy" className="hover:text-[var(--foreground)]">Privacy</Link> · <a href="#" className="hover:text-[var(--foreground)]">Contact</a>
      </footer>
    </div>
  );
}
