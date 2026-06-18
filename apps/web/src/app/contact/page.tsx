export const metadata = { title: "Contact — Nakhla" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black">Contact us</h1>
      <p className="text-muted mt-2">Quickest response within 24 hours.</p>
      <form className="mt-6 space-y-3">
        <label className="block">
          <span className="text-xs font-semibold">Your email</span>
          <input type="email" required className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold">How can we help?</span>
          <textarea rows={6} required className="mt-1 w-full px-3.5 py-3 rounded-xl border border-border" />
        </label>
        <button className="px-5 py-3 rounded-xl brand-gradient text-white font-bold">Send</button>
      </form>
    </div>
  );
}
