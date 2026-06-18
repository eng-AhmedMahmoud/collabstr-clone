import Link from "next/link";

export const metadata = { title: "For creators — Nakhla" };

export default function ForCreatorsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-sm font-semibold text-brand">للمؤثرين · For creators</p>
      <h1 className="text-4xl sm:text-6xl font-black mt-2 leading-tight">
        اكسب بالريال من <span className="brand-text">المحتوى الذي تنشره أصلاً.</span>
      </h1>
      <p className="mt-2 text-lg font-semibold text-fg/80">Get paid in SAR for what you already do.</p>
      <p className="text-lg text-fg/80 mt-5 max-w-2xl">
        حدد باقاتك، اظهر للعلامات السعودية والخليجية، وسلّم المحتوى من لوحة تحكم واحدة. لا حدود ولا حصرية.
      </p>
      <div className="mt-7 flex gap-3">
        <Link href="/signup" className="px-5 py-3 rounded-xl brand-gradient text-white font-bold">انضم مجاناً · Join free</Link>
        <Link href="/influencers" className="px-5 py-3 rounded-xl border border-border font-bold">شاهد أمثلة · Examples</Link>
      </div>

      <div className="mt-14 grid sm:grid-cols-3 gap-5">
        {[
          ["١. ابنِ ملفك · Build your profile", "Add SAR packages, KSA city, audience demographics, and portfolio work."],
          ["٢. احصل على عملاء · Get hired", "Saudi brands book directly. Or apply to open KSA campaigns."],
          ["٣. سلّم واستلم · Deliver & get paid", "Submit content, get approved, SAR funds release to your bank or STC Pay."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-2xl border border-border bg-elevated p-6">
            <h3 className="font-bold text-lg">{t}</h3>
            <p className="text-muted text-sm mt-1.5">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
