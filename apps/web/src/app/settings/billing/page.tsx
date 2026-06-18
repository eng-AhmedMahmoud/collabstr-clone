import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export const metadata = { title: "Billing — Collabstr" };

export default async function BillingPage() {
  const me = await getSession();
  if (!me) redirect("/login?next=/settings/billing");
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black">Billing</h1>

      <section className="mt-6 rounded-2xl border border-[#e5e7eb] bg-white p-6">
        <h2 className="font-bold text-lg">Payment methods</h2>
        <p className="text-sm text-[#6b7280] mt-1">Stub — Stripe Connect wire-up is on the roadmap.</p>
        <div className="mt-4 rounded-lg border border-dashed border-[#e5e7eb] p-6 text-center text-sm text-[#6b7280]">
          No payment methods. <button className="font-semibold text-[#7c3aed] underline">Add card</button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[#e5e7eb] bg-white p-6">
        <h2 className="font-bold text-lg">Invoices</h2>
        <p className="text-sm text-[#6b7280] mt-1">Generated automatically for released orders.</p>
        <p className="text-sm text-[#6b7280] mt-3">No invoices yet.</p>
      </section>
    </div>
  );
}
