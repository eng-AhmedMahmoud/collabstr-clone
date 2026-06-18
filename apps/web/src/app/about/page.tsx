export const metadata = { title: "About — Collabstr" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black">About</h1>
      <p className="text-lg text-[#374151] mt-4 leading-relaxed">
        Collabstr clone is a reference build of a modern influencer marketplace — Next.js on the frontend,
        NestJS + Prisma + PostgreSQL on the backend. It exists to show end-to-end flows: browse, hire,
        escrow, deliver, review.
      </p>
      <p className="text-[#374151] mt-4 leading-relaxed">
        This isn&apos;t a production product. Auth tokens, payments, and notifications are simplified for demo purposes.
      </p>
    </div>
  );
}
