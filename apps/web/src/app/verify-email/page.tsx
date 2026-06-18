import Link from "next/link";

export const metadata = { title: "Verify email — Collabstr" };

export default function VerifyEmailPage() {
  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="mx-auto h-14 w-14 rounded-full brand-gradient text-white grid place-items-center text-2xl">✉️</div>
      <h1 className="text-3xl font-black mt-4">Check your email</h1>
      <p className="text-[#6b7280] mt-2">
        We sent a verification link to your address. Click it to activate your account.
      </p>
      <Link href="/login" className="mt-6 inline-flex px-5 py-3 rounded-xl border border-[#e5e7eb] font-semibold">
        Back to login
      </Link>
    </div>
  );
}
