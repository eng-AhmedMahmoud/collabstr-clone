"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useT, useLocale } from "@/components/locale-provider";
import { safeNext } from "@/lib/safe-next";
import { validateSignup, serverErrorMessage, msg } from "@/lib/validation";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const i = useT();
  const locale = useLocale();
  const [role, setRole] = useState<"brand" | "creator" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    // Instant, field-specific, localized validation before hitting the API.
    const invalid = validateSignup({ name, email, password, handle, role }, locale);
    if (invalid) {
      setErrorField(invalid.field);
      setError(invalid.message);
      return;
    }
    setLoading(true);
    setError(null);
    setErrorField(null);
    try {
      const res = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, role, handle: role === "creator" ? handle.replace(/^@/, "") : undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(serverErrorMessage(res.status, body, locale, "signup"));
        setErrorField(res.status === 409 ? "email" : null);
        return;
      }
      router.refresh();
      const fallback = role === "creator" ? "/creator-dashboard" : "/dashboard";
      router.push(safeNext(searchParams.get("next"), fallback));
    } catch {
      setError(msg("network", locale));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-svh grid grid-rows-[1fr] lg:grid-cols-2">
      <section className="hidden lg:flex relative brand-gradient text-white p-12 flex-col justify-between">
        <Link href="/" className="font-black text-2xl">{i.brand.name}</Link>
        <div>
          <p className="text-white/80 text-sm font-semibold">{i.signup.heroBadge}</p>
          <h2 className="text-4xl font-black mt-3 max-w-md leading-tight">{i.signup.heroH2}</h2>
          <ul className="mt-8 space-y-3 text-sm text-white/90">
            {i.signup.bullets.map((b) => (
              <li key={b}>✓ {b}</li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/70">© {new Date().getFullYear()} {i.brand.name}</p>
      </section>

      <section className="p-6 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-black">{i.signup.title}</h1>
          <p className="text-muted mt-1.5">{i.signup.sub}</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {(["brand", "creator"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`p-4 rounded-xl border text-start transition ${role === r ? "border-fg bg-surface" : "border-border hover:border-fg"}`}
              >
                <p className="font-bold capitalize">{r === "brand" ? i.signup.iAmBrand : i.signup.iAmCreator}</p>
                <p className="text-xs text-muted mt-1">
                  {r === "brand" ? i.signup.brandHelp : i.signup.creatorHelp}
                </p>
              </button>
            ))}
          </div>

          {role && (
            <form onSubmit={submit} className="mt-6 space-y-3">
              <Field label={i.signup.name} value={name} onChange={(v) => { setName(v); setError(null); }} invalid={errorField === "name"} required placeholder="Jane Doe" />
              <Field label={i.signup.email} type="email" value={email} onChange={(v) => { setEmail(v); setError(null); }} invalid={errorField === "email"} required placeholder="you@brand.com" />
              <Field label={i.signup.password} type="password" value={password} onChange={(v) => { setPassword(v); setError(null); }} invalid={errorField === "password"} required placeholder="8+ characters" />
              {role === "creator" && (
                <Field label={i.signup.handle} value={handle} onChange={(v) => { setHandle(v); setError(null); }} invalid={errorField === "handle"} required placeholder="@yourhandle" />
              )}
              <p className="text-xs text-muted">
                {i.signup.agreePre}{" "}
                <Link className="underline" href="/terms">{i.signup.agreeTerms}</Link> {i.signup.agreeAnd}{" "}
                <Link className="underline" href="/privacy">{i.signup.agreePrivacy}</Link>.
              </p>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button disabled={loading} type="submit" className="w-full px-4 py-3 rounded-xl brand-gradient text-white font-bold disabled:opacity-60">
                {loading ? i.signup.creating : i.signup.submit}
              </button>
            </form>
          )}

          <p className="mt-6 text-sm text-muted text-center">
            {i.signup.already}{" "}
            <Link href="/login" className="font-semibold text-fg underline">{i.signup.loginLink}</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, invalid, ...rest }: { label: string; value: string; onChange: (v: string) => void; invalid?: boolean } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-fg/80">{label}</span>
      <input
        {...rest}
        value={value}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 w-full px-3.5 py-3 rounded-xl border bg-elevated ${invalid ? "border-red-500 focus:border-red-500" : "border-border"}`}
      />
    </label>
  );
}
