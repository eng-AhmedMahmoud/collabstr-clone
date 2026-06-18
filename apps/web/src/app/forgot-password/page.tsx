import Link from "next/link";

export const metadata = { title: "Forgot password — Collabstr" };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-black">Forgot password</h1>
      <p className="text-[#6b7280] mt-1.5">Enter your email and we&apos;ll send a reset link.</p>
      <form className="mt-6 space-y-3">
        <label className="block">
          <span className="text-xs font-semibold">Email</span>
          <input type="email" required className="mt-1 w-full px-3.5 py-3 rounded-xl border border-[#e5e7eb]" />
        </label>
        <button className="w-full px-4 py-3 rounded-xl brand-gradient text-white font-bold">Send reset link</button>
      </form>
      <p className="text-xs text-[#6b7280] mt-4">Reset emails are stubbed in this build — check the API logs for the link.</p>
      <p className="text-sm text-[#6b7280] mt-6 text-center">
        Remembered it? <Link href="/login" className="underline">Back to login</Link>
      </p>
    </div>
  );
}
