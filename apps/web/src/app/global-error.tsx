"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import "./globals.css";

// Replaces the root layout when it (or its template) throws, so it must render
// its own <html> and <body>. LocaleProvider is unavailable here — keep copy static.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <main className="flex-1 mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-24 text-center">
          <p className="text-5xl" aria-hidden>
            ⚠️
          </p>
          <h1 className="text-3xl font-black mt-4">Something went wrong</h1>
          <p className="text-muted mt-2">
            An unexpected error occurred. Our team has been notified.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex px-5 py-3 rounded-xl brand-gradient text-white font-bold hover:opacity-95"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
