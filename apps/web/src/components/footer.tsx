import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-brand-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-8 w-8 rounded-lg brand-gradient grid place-items-center font-black">ن</span>
            <span className="font-black text-lg">Nakhla · نخلة</span>
          </div>
          <p className="text-white/70 max-w-xs">
            احجز أفضل صنّاع المحتوى في السعودية على إنستغرام، تيك توك، يوتيوب، وUGC. ادفع بالريال بأمان وأطلق حملتك في أيام.
          </p>
          <p className="text-white/50 max-w-xs mt-3 text-xs">
            Hire vetted KSA creators on Instagram, TikTok, Snapchat, YouTube, and UGC. Pay in SAR. Launch campaigns in days.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-white/70">
            <span className="inline-flex h-5 items-center rounded-full bg-white/10 px-2">🇸🇦 Riyadh, KSA</span>
            <span className="inline-flex h-5 items-center rounded-full bg-white/10 px-2">SAR ر.س</span>
          </div>
        </div>
        <Col title="Brands">
          <Link href="/influencers">Find creators</Link>
          <Link href="/campaigns">Post a campaign</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/dashboard">Dashboard</Link>
        </Col>
        <Col title="Creators">
          <Link href="/for-creators">Join as a creator</Link>
          <Link href="/dashboard">Earnings</Link>
          <Link href="/messages">Inbox</Link>
        </Col>
        <Col title="Company">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/help">Help</Link>
        </Col>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-white/60 text-xs">
        © {new Date().getFullYear()} Nakhla · نخلة. Built for KSA brands and creators.
      </div>
    </footer>
  );
}

function Col({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-semibold mb-3">{title}</h4>
      <ul className="space-y-2 text-white/70">
        {Array.isArray(children)
          ? children.map((c, i) => <li key={i}>{c}</li>)
          : <li>{children}</li>}
      </ul>
    </div>
  );
}
