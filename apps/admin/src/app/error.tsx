"use client";

import { useLocale } from "@/components/locale-provider";

const COPY = {
  en: {
    title: "Something went wrong",
    body: "An unexpected error occurred while loading this page. Your session is intact — try again, or head back to the overview.",
    retry: "Try again",
    home: "Back to overview",
  },
  ar: {
    title: "حدث خطأ ما",
    body: "وقع خطأ غير متوقع أثناء تحميل الصفحة. جلستك سليمة — أعد المحاولة أو ارجع إلى النظرة العامة.",
    retry: "إعادة المحاولة",
    home: "العودة إلى النظرة العامة",
  },
} as const;

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const c = COPY[useLocale()];
  return (
    <div className="min-h-screen grid place-items-center bg-bg px-4">
      <div className="card p-8 max-w-md w-full text-center">
        <p className="text-3xl">⚠</p>
        <h1 className="text-xl font-black mt-3">{c.title}</h1>
        <p className="text-sm text-muted mt-2">{c.body}</p>
        {error.digest && <p className="text-[11px] text-muted font-mono mt-2">ref: {error.digest}</p>}
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={reset} className="px-4 py-2 rounded-lg brand-gradient text-white text-sm font-bold">{c.retry}</button>
          <a href="/" className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-fg/85 hover:bg-surface-2">{c.home}</a>
        </div>
      </div>
    </div>
  );
}
