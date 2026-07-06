"use client";

import { useT } from "@/components/locale-provider";

export default function RouteLoading() {
  const i = useT();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center gap-4" role="status">
      <span className="h-10 w-10 rounded-full border-4 border-border border-t-brand animate-spin" aria-hidden />
      <p className="text-sm text-muted">{i.common.loading}</p>
    </div>
  );
}
