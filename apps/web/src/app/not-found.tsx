import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center px-4 text-center">
      <div>
        <p className="text-6xl">🔍</p>
        <h1 className="text-3xl font-black mt-4">Page not found</h1>
        <p className="text-muted mt-2">The link may be broken, or the page may have moved.</p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/" className="px-5 py-3 rounded-xl brand-gradient text-white font-bold">Go home</Link>
          <Link href="/influencers" className="px-5 py-3 rounded-xl border border-border font-semibold">Browse creators</Link>
        </div>
      </div>
    </div>
  );
}
