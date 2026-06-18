import Link from "next/link";
import { redirect } from "next/navigation";
import { serverApi } from "@/lib/api";
import { getSession } from "@/lib/session";
import { CheckoutForm } from "./checkout-form";
import type { ApiCreator } from "@/lib/types";

export const metadata = { title: "Checkout — Nakhla" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: { searchParams: Promise<{ creator?: string; package?: string }> }) {
  const me = await getSession();
  const { creator: creatorParam, package: packageParam } = await searchParams;

  if (!me) redirect(`/login?next=/checkout${creatorParam ? `?creator=${creatorParam}` : ""}`);
  if (me.role !== "brand") redirect("/dashboard");

  if (!creatorParam) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl font-black">Pick a creator first</h1>
        <p className="text-muted mt-2">Choose a package from a creator&apos;s profile to start checkout.</p>
        <Link href="/influencers" className="mt-6 inline-flex px-5 py-3 rounded-xl brand-gradient text-white font-bold">
          Browse creators
        </Link>
      </div>
    );
  }

  const api = await serverApi();
  const creator = await api.get<ApiCreator>(`/creators/by-username/${encodeURIComponent(creatorParam)}`);
  const pkg = creator.packages?.find((p) => p.id === packageParam) ?? creator.packages?.[0];
  if (!pkg) {
    return <div className="p-12 text-center text-muted">This creator has no packages yet.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href={`/${creator.username}`} className="text-sm text-muted">← Back to profile</Link>
      <h1 className="text-3xl font-black mt-2">Checkout</h1>
      <CheckoutForm creator={creator} pkg={pkg} />
    </div>
  );
}
