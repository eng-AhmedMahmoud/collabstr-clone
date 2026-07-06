"use client";

import { useEffect } from "react";
import { useT } from "@/components/locale-provider";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const i = useT();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-24 text-center">
      <p className="text-5xl" aria-hidden>⚠️</p>
      <h1 className="text-3xl font-black mt-4">{i.errorPage.title}</h1>
      <p className="text-muted mt-2">{i.errorPage.sub}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex px-5 py-3 rounded-xl brand-gradient text-white font-bold hover:opacity-95"
      >
        {i.errorPage.retry}
      </button>
    </div>
  );
}
