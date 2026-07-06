"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useT, useLocale } from "@/components/locale-provider";
import { safeNext } from "@/lib/safe-next";
import { validateLogin, serverErrorMessage, msg } from "@/lib/validation";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (r: { credential: string }) => void }) => void;
          renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const i = useT();
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Set when Google auth succeeds but the account is new — we need a role
  // before the backend can create the user.
  const [pendingCredential, setPendingCredential] = useState<string | null>(null);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const finishLogin = useCallback(
    (user: { role: string; locale?: string }) => {
      // Sync the user's stored locale preference into the cookie so the next
      // server render uses it. The backend already sets this cookie itself,
      // but we mirror it here in case third-party cookies are blocked.
      if (user.locale === "ar" || user.locale === "en") {
        document.cookie = `locale=${user.locale}; path=/; max-age=${365 * 24 * 60 * 60}`;
      }
      router.refresh();
      const fallback = user.role === "creator" ? "/creator-dashboard" : "/dashboard";
      router.push(safeNext(next, fallback));
    },
    [router, next]
  );

  const googleLogin = useCallback(
    async (credential: string, role?: "brand" | "creator") => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/v1/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ credential, role, locale }),
        });
        const body = await res.json().catch(() => ({}));
        if (res.status === 409 && body?.code === "ROLE_REQUIRED") {
          setPendingCredential(credential);
          return;
        }
        if (!res.ok) {
          setError(serverErrorMessage(res.status, body, locale, "login"));
          return;
        }
        setPendingCredential(null);
        finishLogin(body);
      } catch {
        setError(msg("network", locale));
      } finally {
        setLoading(false);
      }
    },
    [locale, finishLogin]
  );

  // Load Google Identity Services and render the official button.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) return;
    const target = googleButtonRef.current;
    let cancelled = false;

    function render() {
      if (cancelled || !window.google || !target) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID!,
        callback: (r) => googleLogin(r.credential),
      });
      target.innerHTML = "";
      window.google.accounts.id.renderButton(target, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        locale: locale === "ar" ? "ar" : "en",
        width: Math.min(400, target.offsetWidth || 400),
      });
    }

    if (window.google) {
      render();
      return;
    }
    const existing = document.getElementById("google-gsi-script") as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    if (!existing) {
      script.id = "google-gsi-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", render);
    return () => {
      cancelled = true;
      script.removeEventListener("load", render);
    };
  }, [googleLogin, locale]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = validateLogin({ email, password }, locale);
    if (invalid) {
      setError(invalid.message);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(serverErrorMessage(res.status, body, locale, "login"));
        return;
      }
      finishLogin(await res.json());
    } catch {
      setError(msg("network", locale));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-3">
      {pendingCredential ? (
        <div className="p-4 rounded-xl border border-border bg-surface">
          <p className="text-sm font-semibold">{i.login.googleRole}</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(["brand", "creator"] as const).map((r) => (
              <button
                key={r}
                type="button"
                disabled={loading}
                onClick={() => googleLogin(pendingCredential, r)}
                className="p-3 rounded-xl border border-border hover:border-fg font-bold text-sm disabled:opacity-60"
              >
                {r === "brand" ? i.signup.iAmBrand : i.signup.iAmCreator}
              </button>
            ))}
          </div>
        </div>
      ) : GOOGLE_CLIENT_ID ? (
        <div ref={googleButtonRef} className="flex justify-center min-h-11" />
      ) : (
        <button type="button" disabled className="w-full px-4 py-3 rounded-xl border border-border font-semibold flex items-center justify-center gap-2 opacity-60">
          {i.login.google}
        </button>
      )}
      <button type="button" disabled className="w-full px-4 py-3 rounded-xl border border-border font-semibold flex items-center justify-center gap-2 opacity-60">
        {i.login.appleSoon}
      </button>
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="flex-1 h-px bg-border" /> {i.login.or} <span className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="text-xs font-semibold text-fg/80">{i.login.email}</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@brand.com" className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border bg-elevated" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-fg/80">{i.login.password}</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="••••••••" className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border bg-elevated" />
        </label>
        <div className="flex items-center justify-end text-sm">
          <Link href="/forgot-password" className="font-semibold text-brand hover:underline">{i.login.forgot}</Link>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} type="submit" className="w-full px-4 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">
          {loading ? i.common.loading : i.login.submit}
        </button>
      </form>
    </div>
  );
}
