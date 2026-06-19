import Link from "next/link";
import { t } from "@/lib/i18n";

export async function Footer() {
  const i = await t();
  return (
    <footer className="mt-24 border-t border-border bg-brand-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-8 w-8 rounded-lg brand-gradient grid place-items-center font-black">ن</span>
            <span className="font-black text-lg">{i.brand.name}</span>
          </div>
          <p className="text-white/70 max-w-xs">
            {i.footer.blurb}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-white/70">
            <span className="inline-flex h-5 items-center rounded-full bg-white/10 px-2">🇸🇦 Riyadh, KSA</span>
            <span className="inline-flex h-5 items-center rounded-full bg-white/10 px-2">SAR ر.س</span>
          </div>
        </div>
        <Col title={i.footer.brands}>
          <Link href="/influencers">{i.footer.findCreators}</Link>
          <Link href="/campaigns">{i.footer.postCampaign}</Link>
          <Link href="/pricing">{i.footer.pricing}</Link>
          <Link href="/dashboard">{i.footer.dashboard}</Link>
        </Col>
        <Col title={i.footer.creators}>
          <Link href="/for-creators">{i.footer.joinCreator}</Link>
          <Link href="/dashboard">{i.footer.earnings}</Link>
          <Link href="/messages">{i.footer.inbox}</Link>
        </Col>
        <Col title={i.footer.company}>
          <Link href="/about">{i.footer.about}</Link>
          <Link href="/contact">{i.footer.contact}</Link>
          <Link href="/terms">{i.footer.terms}</Link>
          <Link href="/privacy">{i.footer.privacy}</Link>
          <Link href="/help">Help</Link>
        </Col>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-white/60 text-xs">
        © {new Date().getFullYear()} {i.brand.name}.
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
