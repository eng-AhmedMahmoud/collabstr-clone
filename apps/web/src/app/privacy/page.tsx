export const metadata = { title: "Privacy — Nakhla" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black">Privacy policy</h1>
      <p className="text-muted mt-4">Last updated: today.</p>
      <p className="mt-4 text-fg/80">
        Demo build. No PII is stored in production. Replace this with your own privacy policy before launch.
      </p>
    </div>
  );
}
