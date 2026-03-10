import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Sidebar } from "@/components/Sidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/Toast";
import { MobileNav } from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "BiteSized",
  description: "Turn any document, article, or video into a study pack: summary, key points, flashcards, quiz, and more.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "BiteSized",
    description: "Turn any document, article, or video into a study pack.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BiteSized",
    description: "Turn any document, article, or video into a study pack.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex">
        <a
          href="#main-content"
          className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:w-auto focus:h-auto focus:overflow-visible focus:px-4 focus:py-2 focus:rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:bg-[var(--card)] focus:text-[var(--foreground)] focus:[clip:auto] focus:m-0 focus:p-4"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <ToastProvider>
            <div className="flex flex-1 flex-col min-h-0">
              <MobileNav />
              <div className="flex flex-1 min-h-0">
                <Sidebar />
                <main id="main-content" className="flex-1 overflow-auto min-w-0">
                  <ErrorBoundary>{children}</ErrorBoundary>
                </main>
              </div>
            </div>
          </ToastProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
