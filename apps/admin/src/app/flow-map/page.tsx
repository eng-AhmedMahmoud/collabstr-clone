import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { PageHeader } from "@/components/ui";
import { getAdminSession } from "@/lib/session";
import { Architecture } from "./architecture";
import { OrderStateMachine } from "./order-state-machine";
import { CoverageMatrix } from "./coverage-matrix";
import { RoleFlows } from "./role-flows";
import { Roadmap } from "./roadmap";
import { t as serverT } from "@/lib/i18n";

export const metadata = { title: "Flow map · Admin · Nakhla" };
export const dynamic = "force-dynamic";

export default async function FlowMapAdmin() {
  const me = await getAdminSession();
  if (!me) redirect("/login?next=/flow-map");
  const i = await serverT();
  return (
    <Shell me={me}>
      <PageHeader title={i.flowMap.title} subtitle={i.flowMap.sub} />

      <nav className="flex flex-wrap gap-2 mb-6">
        {[
          ["arch", i.flowMap.sections.arch],
          ["flows", i.flowMap.sections.flows],
          ["states", i.flowMap.sections.states],
          ["coverage", i.flowMap.sections.coverage],
          ["roadmap", i.flowMap.sections.roadmap],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} className="px-3.5 py-1.5 rounded-full text-sm font-semibold border border-[#1f1f30] text-[#d1d1da] hover:border-[#8b8ba0]">
            {label}
          </a>
        ))}
      </nav>

      <Section id="arch" title={i.flowMap.archTitle} subtitle={i.flowMap.archSub}>
        <Architecture />
      </Section>

      <Section id="flows" title={i.flowMap.flowsTitle} subtitle={i.flowMap.flowsSub}>
        <RoleFlows />
      </Section>

      <Section id="states" title={i.flowMap.statesTitle} subtitle={i.flowMap.statesSub}>
        <OrderStateMachine />
      </Section>

      <Section id="coverage" title={i.flowMap.coverageTitle} subtitle={i.flowMap.coverageSub}>
        <CoverageMatrix />
      </Section>

      <Section id="roadmap" title={i.flowMap.roadmapTitle} subtitle={i.flowMap.roadmapSub}>
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
