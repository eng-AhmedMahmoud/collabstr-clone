"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/components/locale-provider";

export type ConsentState = { v: 1; ts: string; analytics: boolean; marketing: boolean };

const COOKIE = "nkl_consent";
const MAX_AGE = 180 * 24 * 60 * 60; // PDPL/GDPR: re-ask at most every 6 months
export const CONSENT_OPEN_EVENT = "nkl:consent-open";
export const CONSENT_CHANGE_EVENT = "nkl:consent-change";

export function readConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return parsed?.v === 1 ? (parsed as ConsentState) : null;
  } catch {
    return null;
  }
}

/** Gate for analytics/marketing scripts: hasConsent("analytics") */
export function hasConsent(category: "analytics" | "marketing"): boolean {
  return readConsent()?.[category] === true;
}

/** Reopen the consent manager from anywhere (footer link, settings page). */
export function openConsentManager() {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}

function writeConsent(analytics: boolean, marketing: boolean) {
  const state: ConsentState = { v: 1, ts: new Date().toISOString(), analytics, marketing };
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(state))}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: state }));
}

function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? "bg-brand" : "bg-border"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
          checked ? "start-[calc(100%-1.375rem)]" : "start-0.5"
        }`}
      />
    </button>
  );
}

export function CookieConsent() {
  const t = useT();
  const c = t.consent;
  const [visible, setVisible] = useState(false);
  const [managing, setManaging] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (!existing) setVisible(true);
    const reopen = () => {
      const cur = readConsent();
      setAnalytics(cur?.analytics ?? false);
      setMarketing(cur?.marketing ?? false);
      setManaging(true);
      setVisible(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  const close = useCallback((a: boolean, m: boolean) => {
    writeConsent(a, m);
    setVisible(false);
    setManaging(false);
  }, []);

  if (!visible) return null;

  const cats: Array<{
    key: "essential" | "analytics" | "marketing";
    checked: boolean;
    disabled?: boolean;
    set?: (v: boolean) => void;
  }> = [
    { key: "essential", checked: true, disabled: true },
    { key: "analytics", checked: analytics, set: setAnalytics },
    { key: "marketing", checked: marketing, set: setMarketing },
  ];

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={c.title}
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl animate-consent-in"
    >
      <div className="glass rounded-2xl border border-border shadow-2xl p-5 sm:p-6">
        <h2 className="text-base font-bold">{c.title}</h2>
        <p className="mt-1.5 text-sm text-muted leading-relaxed">
          {c.message}{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-fg transition-colors">
            {c.privacyLink}
          </Link>
        </p>

        {managing && (
          <ul className="mt-4 space-y-3">
            {cats.map(({ key, checked, disabled, set }) => (
              <li key={key} className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold">{c.categories[key][0]}</div>
                  <div className="text-xs text-muted">{c.categories[key][1]}</div>
                </div>
                <Toggle checked={checked} disabled={disabled} onChange={set} label={c.categories[key][0]} />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => close(true, true)}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-95 hover:-translate-y-0.5 transition-all"
          >
            {c.acceptAll}
          </button>
          {managing ? (
            <button
              type="button"
              onClick={() => close(analytics, marketing)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-surface transition-colors"
            >
              {c.save}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => close(false, false)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-surface transition-colors"
              >
                {c.essentialOnly}
              </button>
              <button
                type="button"
                onClick={() => setManaging(true)}
                className="px-2 py-2 text-sm text-muted underline underline-offset-2 hover:text-fg transition-colors"
              >
                {c.manage}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
