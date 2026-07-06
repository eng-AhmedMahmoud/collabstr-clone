"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLATFORMS, CATEGORIES } from "@/lib/data";
import { useT, useLocale } from "@/components/locale-provider";
import { validateCampaign, serverErrorMessage, msg } from "@/lib/validation";

export type ManagedCampaign = {
  id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  platforms: string[];
  categories: string[];
  creatorsNeeded: number;
  deadline: string | null;
  status: string;
  _count?: { applications: number };
};

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export function CampaignsManager({ initial }: { initial: ManagedCampaign[] }) {
  const i = useT();
  const [list, setList] = useState<ManagedCampaign[]>(initial);

  if (list.length === 0) {
    return <p className="mt-8 rounded-2xl border border-border bg-elevated p-8 text-center text-sm text-muted">{i.campaignManage.none}</p>;
  }

  return (
    <div className="mt-8 space-y-4">
      {list.map((c) => (
        <CampaignRow
          key={c.id}
          campaign={c}
          onChange={(next) => setList((l) => l.map((x) => (x.id === next.id ? next : x)))}
          onDelete={(id) => setList((l) => l.filter((x) => x.id !== id))}
        />
      ))}
    </div>
  );
}

function CampaignRow({
  campaign,
  onChange,
  onDelete,
}: {
  campaign: ManagedCampaign;
  onChange: (next: ManagedCampaign) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const i = useT();
  const locale = useLocale();

  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const [title, setTitle] = useState(campaign.title);
  const [description, setDescription] = useState(campaign.description);
  const [budgetMin, setBudgetMin] = useState(String(campaign.budgetMin));
  const [budgetMax, setBudgetMax] = useState(String(campaign.budgetMax));
  const [platforms, setPlatforms] = useState<string[]>(campaign.platforms);
  const [categories, setCategories] = useState<string[]>(campaign.categories);
  const [creatorsNeeded, setCreatorsNeeded] = useState(String(campaign.creatorsNeeded));
  const [deadline, setDeadline] = useState(toDateInput(campaign.deadline));

  const isOpen = campaign.status === "open";
  const applicants = campaign._count?.applications ?? 0;

  function resetForm() {
    setTitle(campaign.title);
    setDescription(campaign.description);
    setBudgetMin(String(campaign.budgetMin));
    setBudgetMax(String(campaign.budgetMax));
    setPlatforms(campaign.platforms);
    setCategories(campaign.categories);
    setCreatorsNeeded(String(campaign.creatorsNeeded));
    setDeadline(toDateInput(campaign.deadline));
    setError(null);
    setErrorField(null);
  }

  function toggle(current: string[], set: (v: string[]) => void, value: string) {
    setError(null); setErrorField(null); setOk(false);
    set(current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  }

  async function toggleStatus() {
    setBusy(true); setError(null); setOk(false);
    const next = isOpen ? "closed" : "open";
    try {
      const res = await fetch(`/api/v1/campaigns/${campaign.id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      onChange({ ...campaign, status: next });
      router.refresh();
    } catch {
      setError(i.campaignManage.statusError);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(i.campaignManage.confirmDelete)) return;
    setBusy(true); setError(null); setOk(false);
    try {
      const res = await fetch(`/api/v1/campaigns/${campaign.id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      onDelete(campaign.id);
      router.refresh();
    } catch {
      setError(i.campaignManage.deleteError);
      setBusy(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const invalid = validateCampaign({ title, description, platforms, categories, budgetMin, budgetMax }, locale);
    if (invalid) { setError(invalid.message); setErrorField(invalid.field); return; }
    setBusy(true); setError(null); setErrorField(null); setOk(false);
    try {
      const res = await fetch(`/api/v1/campaigns/${campaign.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          budgetMin: Math.round(Number(budgetMin)),
          budgetMax: Math.round(Number(budgetMax)),
          platforms,
          categories,
          creatorsNeeded: Math.max(1, Math.round(Number(creatorsNeeded)) || 1),
          deadline: deadline ? new Date(deadline).toISOString() : null,
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setError(serverErrorMessage(res.status, b, locale));
        return;
      }
      const updated = (await res.json()) as Partial<ManagedCampaign>;
      onChange({ ...campaign, ...updated, _count: campaign._count });
      setOk(true);
      setEditing(false);
    } catch {
      setError(msg("network", locale));
    } finally {
      setBusy(false);
    }
  }

  const inputCls = (invalid: boolean) =>
    `mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-elevated ${invalid ? "border-red-500 focus:border-red-500" : "border-border"}`;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <Link href={`/campaigns/${campaign.id}`} className="font-bold hover:text-brand">{campaign.title}</Link>
          <p className="text-xs text-muted mt-0.5">
            <span className={`font-semibold ${isOpen ? "text-emerald-600" : "text-muted"}`}>
              {i.status[campaign.status as keyof typeof i.status] ?? campaign.status}
            </span>
            {" · "}{applicants} {i.campaignManage.applicants}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button type="button" onClick={() => { if (!editing) resetForm(); setEditing((v) => !v); setOk(false); }} disabled={busy}
            className="px-3 py-1.5 rounded-lg border border-border text-sm font-semibold hover:bg-surface disabled:opacity-50">{i.campaignManage.edit}</button>
          <button type="button" onClick={toggleStatus} disabled={busy}
            className="px-3 py-1.5 rounded-lg border border-border text-sm font-semibold hover:bg-surface disabled:opacity-50">{isOpen ? i.campaignManage.close : i.campaignManage.open}</button>
          <button type="button" onClick={remove} disabled={busy}
            className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-50">{i.campaignManage.delete}</button>
        </div>
      </div>

      {!editing && error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      {!editing && ok && <p className="text-sm text-emerald-600 mt-3">{i.campaignManage.saved}</p>}

      {editing && (
        <form onSubmit={save} className="mt-4 border-t border-border pt-4 space-y-3">
          <label className="block">
            <span className="text-xs font-semibold text-fg/80">{i.campaignManage.title_}</span>
            <input value={title} onChange={(e) => { setTitle(e.target.value); setError(null); setErrorField(null); }} aria-invalid={errorField === "title" || undefined} className={inputCls(errorField === "title")} />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-fg/80">{i.campaignManage.description}</span>
            <textarea value={description} onChange={(e) => { setDescription(e.target.value); setError(null); setErrorField(null); }} rows={4} aria-invalid={errorField === "description" || undefined} className={inputCls(errorField === "description")} />
          </label>

          <div>
            <p className="text-xs font-semibold text-fg/80 mb-2">{i.campaignManage.platforms}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PLATFORMS.map((p) => (
                <button type="button" key={p.value} onClick={() => toggle(platforms, setPlatforms, p.value)}
                  className={`p-2.5 rounded-xl border text-start ${platforms.includes(p.value) ? "border-fg bg-surface" : "border-border hover:border-fg"}`}>
                  <span className="text-lg">{p.icon}</span>
                  <p className="font-bold mt-0.5 text-xs">{locale === "ar" ? p.ar : p.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-fg/80 mb-2">{i.campaignManage.categories}</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button type="button" key={c.label} onClick={() => toggle(categories, setCategories, c.label)}
                  className={`text-sm px-3 py-1.5 rounded-full border ${categories.includes(c.label) ? "border-fg bg-surface" : "border-border hover:border-fg"}`}>
                  {c.emoji} {locale === "ar" ? c.ar : c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-fg/80">{i.campaignManage.minBudget}</span>
              <input type="number" min={0} step={1} value={budgetMin} onChange={(e) => { setBudgetMin(e.target.value); setError(null); setErrorField(null); }} aria-invalid={errorField === "budget" || undefined} className={inputCls(errorField === "budget")} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-fg/80">{i.campaignManage.maxBudget}</span>
              <input type="number" min={0} step={1} value={budgetMax} onChange={(e) => { setBudgetMax(e.target.value); setError(null); setErrorField(null); }} aria-invalid={errorField === "budget" || undefined} className={inputCls(errorField === "budget")} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-fg/80">{i.campaignManage.needed}</span>
              <input type="number" min={1} step={1} value={creatorsNeeded} onChange={(e) => setCreatorsNeeded(e.target.value)} className={inputCls(false)} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-fg/80">{i.campaignManage.deadline}</span>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls(false)} />
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg brand-gradient text-white text-sm font-bold disabled:opacity-60">
              {busy ? i.common.saving : i.campaignManage.save}
            </button>
            <button type="button" onClick={() => { resetForm(); setEditing(false); }} className="px-4 py-2 rounded-lg border border-border text-sm font-semibold">
              {i.campaignManage.cancel}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
