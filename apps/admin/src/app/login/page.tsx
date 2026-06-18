import { LoginForm } from "./login-form";
import { t as serverT } from "@/lib/i18n";

export const metadata = { title: "Admin · Sign in · Nakhla" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const t = await serverT();
  return (
    <div className="min-h-screen grid place-items-center bg-[#0b0b14] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg brand-gradient grid place-items-center text-white font-black">ن</span>
            <span className="font-black text-lg">{t.brand.name}</span>
          </div>
          <p className="text-xs uppercase tracking-widest text-[#8b8ba0] mt-2">{t.brand.sub}</p>
        </div>
        <div className="card p-6">
          <h1 className="text-xl font-black">{t.login.title}</h1>
          <p className="text-sm text-[#8b8ba0] mt-1">{t.login.sub}</p>
          {error === "not_admin" && (
            <p className="mt-3 text-xs text-red-300 bg-red-500/10 border border-red-500/30 p-2.5 rounded-lg">
              {t.login.notAdmin}
            </p>
          )}
          <LoginForm next={next} labels={{ email: t.login.email, password: t.login.password, submit: t.login.submit }} />
        </div>
        <p className="text-xs text-[#8b8ba0] text-center mt-4">
          Demo: <code>admin@nakhla.sa</code> · <code>Admin1234!</code>
        </p>
      </div>
    </div>
  );
}
