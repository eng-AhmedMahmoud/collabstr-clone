import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { t } from "@/lib/i18n";

export const metadata = { title: "Billing — Nakhla" };

export default async function BillingPage() {
  const i = await t();
  const me = await getSession();
  if (!me) redirect("/login?next=/settings/billing");
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black">{i.settings.billing.title}</h1>

      <section className="mt-6 rounded-2xl border border-border bg-elevated p-6">
        <h2 className="font-bold text-lg">{i.settings.billing.methods}</h2>
        <p className="text-sm text-muted mt-1">{i.settings.billing.methodsSub}</p>
        <div className="mt-4 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
          {i.settings.billing.none} <button className="font-semibold text-brand underline">{i.settings.billing.addCard}</button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-elevated p-6">
        <h2 className="font-bold text-lg">{i.settings.billing.invoices}</h2>
        <p className="text-sm text-muted mt-1">{i.settings.billing.invoicesSub}</p>
        <p className="text-sm text-muted mt-3">{i.settings.billing.noInvoices}</p>
      </section>
    </div>
  );
}
