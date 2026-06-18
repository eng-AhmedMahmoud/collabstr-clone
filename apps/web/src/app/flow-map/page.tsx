import Link from "next/link";
import { Architecture } from "./architecture";
import { OrderStateMachine } from "./order-state-machine";
import { CoverageMatrix } from "./coverage-matrix";
import { RoleFlows } from "./role-flows";
import { Roadmap } from "./roadmap";

export const metadata = { title: "Flow map — Collabstr clone" };

export default function FlowMapPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#7c3aed]">System overview</p>
        <h1 className="text-4xl sm:text-5xl font-black mt-2">Flow map</h1>
        <p className="text-[#6b7280] mt-2 max-w-2xl">
          How the pieces fit together — frontend, backend, database, and every user journey already wired up.
          Plus what&apos;s next on the roadmap.
        </p>
        <nav className="mt-6 flex flex-wrap gap-2">
          {[
            ["arch", "Architecture"],
            ["flows", "Role flows"],
            ["states", "Order lifecycle"],
            ["coverage", "Page coverage"],
            ["roadmap", "Roadmap"],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="px-3.5 py-1.5 rounded-full text-sm font-semibold border border-[#e5e7eb] hover:border-[#0b0b14]">
              {label}
            </a>
          ))}
        </nav>
      </header>

      <Section id="arch" title="System architecture" subtitle="Request flow from browser to database">
        <Architecture />
      </Section>

      <Section id="flows" title="Role-based flows" subtitle="What each user type can do">
        <RoleFlows />
      </Section>

      <Section id="states" title="Order lifecycle" subtitle="Escrow state machine guarded by the API">
        <OrderStateMachine />
      </Section>

      <Section id="coverage" title="Page coverage" subtitle="Every route shipped, gated by session">
        <CoverageMatrix />
      </Section>

      <Section id="roadmap" title="Roadmap" subtitle="Next concrete steps in priority order">
        <Roadmap />
      </Section>

      <footer className="mt-16 rounded-3xl p-10 brand-gradient text-white text-center">
        <h2 className="text-3xl font-black">Ready to extend it?</h2>
        <p className="text-white/90 mt-2 max-w-xl mx-auto">
          The schema, modules, and pages are all in place. Pick a roadmap card and ship it.
        </p>
        <div className="mt-6 flex gap-3 justify-center flex-wrap">
          <Link href="/dashboard" className="px-5 py-3 rounded-xl bg-white text-[#0b0b14] font-bold">Brand dashboard</Link>
          <Link href="/creator-dashboard" className="px-5 py-3 rounded-xl bg-white/10 text-white font-bold">Creator dashboard</Link>
          <a href="https://github.com/eng-AhmedMahmoud/collabstr-clone" target="_blank" className="px-5 py-3 rounded-xl bg-white/10 text-white font-bold">View repo</a>
        </div>
      </footer>
    </div>
  );
}

function Section({ id, title, subtitle, children }: { id: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 mt-16 first:mt-0">
      <h2 className="text-2xl sm:text-3xl font-black">{title}</h2>
      <p className="text-[#6b7280] text-sm mt-1">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}
