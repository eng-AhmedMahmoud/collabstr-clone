"use client";

// Catches errors thrown by the root layout itself. Replaces the entire root
// layout when active, so it must render its own <html>/<body> and cannot rely
// on LocaleProvider — copy is shown in both languages.
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Safe no-op when Sentry.init was skipped (no DSN configured).
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="min-h-screen grid place-items-center bg-bg px-4">
          <div className="card p-8 max-w-md w-full text-center">
            <p className="text-3xl">⚠</p>
            <h1 className="text-xl font-black mt-3">Something went wrong</h1>
            <p className="text-lg font-black" dir="rtl">حدث خطأ ما</p>
            <p className="text-sm text-muted mt-2">
              An unexpected error occurred. Try again, or head back to the overview.
            </p>
            <p className="text-sm text-muted mt-1" dir="rtl">
              وقع خطأ غير متوقع. أعد المحاولة أو ارجع إلى النظرة العامة.
            </p>
            {error.digest && <p className="text-[11px] text-muted font-mono mt-2">ref: {error.digest}</p>}
            <div className="mt-6 flex justify-center gap-2">
              <button onClick={reset} className="px-4 py-2 rounded-lg brand-gradient text-white text-sm font-bold">
                Try again · إعادة المحاولة
              </button>
              <a href="/" className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-fg/85 hover:bg-surface-2">
                Overview · النظرة العامة
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
