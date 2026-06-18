import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { PageHeader } from "@/components/ui";
import { getAdminSession } from "@/lib/session";
import { Architecture } from "./architecture";
import { OrderStateMachine } from "./order-state-machine";
import { CoverageMatrix } from "./coverage-matrix";
import { RoleFlows } from "./role-flows";
import { Roadmap } from "./roadmap";

export const metadata = { title: "Flow map · Admin · Nakhla" };
export const dynamic = "force-dynamic";

export default async function FlowMapAdmin() {
  const me = await getAdminSession();
  if (!me) redirect("/login?next=/flow-map");
  return (
    <Shell me={me}>
      <PageHeader title="Flow map" subtitle="System architecture, role flows, lifecycle, coverage, roadmap" />

      <nav className="flex flex-wrap gap-2 mb-6">
        {[
          ["arch", "Architecture"],
          ["flows", "Role flows"],
          ["states", "Order lifecycle"],
          ["coverage", "Page coverage"],
          ["roadmap", "Roadmap"],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} className="px-3.5 py-1.5 rounded-full text-sm font-semibold border border-[#1f1f30] text-[#d1d1da] hover:border-[#8b8ba0]">
            {label}
          </a>
        ))}
      </nav>

      <Section id="arch" title="System architecture" subtitle="Request flow from browser to database">
        <Architecture />
      </Section>

      <Section id="flows" title="Role-based flows" subtitle="What each user type can do">
        <RoleFlows />
      </Section>

      <Section id="states" title="Order lifecycle" subtitle="Escrow state machine guarded by the API">
        <OrderStateMachine />
      </Section>

      <Section id="coverage" title="Page coverage" subtitle="Every web + admin route, gated by session">
        <CoverageMatrix />
      </Section>

      <Section id="roadmap" title="Roadmap" subtitle="Next concrete steps in priority order">
        <Roadmap />
      </Section>
    </Shell>
  );
}

function Section({ id, title, subtitle, children }: { id: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 mt-12 first:mt-0">
      <h2 className="text-xl font-black">{title}</h2>
      <p className="text-[#8b8ba0] text-sm mt-0.5">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}
