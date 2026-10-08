import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Building2, ChevronLeft, ChevronRight, CircleAlert, FilterX, Layers3, ListChecks, LoaderCircle, LogOut, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { clearAccessToken } from "@/lib/auth";
import { getCRMCampaigns, getCRMLeads, getCRMOverview } from "@/APIs/api/odooCrm";
import type { Campaign, Lead } from "@/APIs/api/odooCrm";

const PAGE_SIZE = 25;
const stateLabel = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, x => x.toUpperCase());
const stateTone = (value: string) =>
  value === "active" || value === "assigned" ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
  : value === "paused" || value === "callback" ? "border-amber-400/25 bg-amber-400/10 text-amber-300"
  : value === "closed" || value === "blocked" ? "border-rose-400/25 bg-rose-400/10 text-rose-300"
  : "border-slate-400/25 bg-slate-400/10 text-slate-300";

function StateBadge({ state }: { state: string }) {
  return <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${stateTone(state)}`}>{stateLabel(state)}</span>;
}

function Failure({ error, retry }: { error: unknown; retry: () => void }) {
  const responseCode = (error as { response?: { status?: number } })?.response?.status;
  const message = responseCode === 403
    ? "This area is restricted to authorized Codestra staff."
    : responseCode === 503
    ? "The Odoo connection is not configured or is currently unavailable."
    : "The CRM data could not be loaded. No sample or cached data has been substituted.";
  return (
    <section role="alert" className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-7">
      <CircleAlert size={26} className="text-rose-300"/>
      <h2 className="mt-3 text-xl font-semibold">CRM connection unavailable</h2>
      <p className="mt-2 max-w-xl text-slate-300">{message}</p>
      <button type="button" onClick={retry} className="mt-5 rounded-lg border border-rose-300/40 px-5 py-2.5 text-sm hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-amber-400">Retry connection</button>
    </section>
  );
}

function Empty({ message }: { message: string }) {
  return <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-8 py-14 text-center text-slate-400"><Layers3 className="mx-auto mb-3 text-amber-300" size={30}/>{message}</div>;
}

function Pager({ page, total, back, next }: {page:number; total:number; back:()=>void; next:()=>void}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-5 text-sm text-slate-400">
      <span>Page {page} · {total} records</span>
      <div className="flex gap-2">
        <button type="button" onClick={back} disabled={page <= 1} aria-label="Previous page" className="rounded-lg border border-white/20 p-2 enabled:hover:bg-white/10 disabled:opacity-30"><ChevronLeft size={20}/></button>
        <button type="button" onClick={next} disabled={page * PAGE_SIZE >= total} aria-label="Next page" className="rounded-lg border border-white/20 p-2 enabled:hover:bg-white/10 disabled:opacity-30"><ChevronRight size={20}/></button>
      </div>
    </div>
  );
}

export default function CRMWorkspace() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"campaigns" | "leads">("campaigns");
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [term, setTerm] = useState("");
  const [campaignPage, setCampaignPage] = useState(1);
  const [leadPage, setLeadPage] = useState(1);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

  const overview = useQuery({ queryKey: ["odoo-crm", "overview"], queryFn: getCRMOverview, retry: 1, staleTime: 30000 });
  const campaignQuery = useQuery({ queryKey: ["odoo-crm", "campaigns", campaignPage], queryFn: () => getCRMCampaigns(campaignPage), enabled: overview.isSuccess && tab === "campaigns", retry: 1 });
  const leadQuery = useQuery({ queryKey: ["odoo-crm", "leads", leadPage, campaign?.id], queryFn: () => getCRMLeads(leadPage, campaign?.id), enabled: overview.isSuccess && tab === "leads", retry: 1 });
  const active = tab === "campaigns" ? campaignQuery : leadQuery;
  const total = tab === "campaigns" ? campaignQuery.data?.total ?? 0 : leadQuery.data?.total ?? 0;
  const currentPage = tab === "campaigns" ? campaignPage : leadPage;
  const items = useMemo(() => {
    const raw = tab === "campaigns" ? campaignQuery.data?.campaigns ?? [] : leadQuery.data?.leads ?? [];
    const needle = term.toLowerCase().trim();
    return needle ? raw.filter(x => String(x.name).toLowerCase().includes(needle)
      || ("code" in x && String(x.code).toLowerCase().includes(needle))) : raw;
  }, [tab, campaignQuery.data, leadQuery.data, term]);
  const reload = () => { void qc.invalidateQueries({ queryKey: ["odoo-crm"] }); };
  const logout = () => { clearAccessToken(); navigate("/login", { replace: true }); };
  const selectCampaign = (item: Campaign) => { setCampaign(item); setSelectedLeadId(null); setTerm(""); setLeadPage(1); setTab("leads"); };
  const setActiveTab = (newTab: "campaigns" | "leads") => { setTab(newTab); setSelectedLeadId(null); setTerm(""); };
  const configuredURL = String(import.meta.env.VITE_ODOO_WEB_URL || "");
  const externalOdooURL = configuredURL.startsWith("https://") ? configuredURL : "";

  return (
    <main className="min-h-screen bg-[#080b13] text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5 md:px-10">
        <Link to="/auth/dashboard" className="flex items-center gap-3 text-base font-semibold focus-visible:outline-2 focus-visible:outline-amber-400"><Building2 className="text-amber-300" size={24}/> Codestra <span className="font-normal text-slate-400">/ CRM</span></Link>
        <div className="flex gap-3">
          <Link to="/auth/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10"><ArrowLeft size={16}/> Dashboard</Link>
          <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10"><LogOut size={16}/> Sign out</button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:px-10">
        <p className="flex items-center gap-2 text-sm font-medium text-amber-300"><ShieldCheck size={17}/> Odoo 20 · Staff-only · Live read-only data</p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-5">
          <div><h1 className="text-3xl font-bold tracking-tight md:text-4xl">Call Center Control</h1><p className="mt-3 max-w-xl leading-relaxed text-slate-400">A clear view of campaigns and lead queues, protected by Odoo membership and Codestra staff permissions.</p></div>
          <div className="flex gap-3">
            <button type="button" onClick={reload} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-amber-400"><RefreshCw size={17}/> Refresh</button>
            {externalOdooURL && <a href={externalOdooURL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300">Open Odoo <ArrowRight size={17}/></a>}
          </div>
        </div>
        {overview.isLoading && <div role="status" className="mt-10 flex items-center gap-3 text-slate-400"><LoaderCircle size={20} className="animate-spin"/> Checking CRM connection…</div>}
        {overview.isError && <div className="mt-10"><Failure error={overview.error} retry={reload}/></div>}
        {overview.data && <>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6"><div className="text-sm text-slate-400">Visible campaigns</div><div className="mt-3 text-4xl font-semibold">{overview.data.total}</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6"><div className="text-sm text-slate-400">Visible CRM leads</div><div className="mt-3 text-4xl font-semibold">{overview.data.lead_count_visible}</div></div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6"><div className="text-sm text-emerald-300">Connected · {stateLabel(overview.data.role)}</div><div className="mt-3 flex items-center gap-2 text-base font-semibold"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400"/> Odoo API online</div></div>
          </div>
          <section className="mt-9 rounded-2xl border border-white/10 bg-[#101626] p-5 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div role="tablist" aria-label="CRM sections" className="flex gap-2">
                {(["campaigns", "leads"] as const).map(value => <button type="button" role="tab" aria-selected={tab === value} key={value} onClick={() => setActiveTab(value)} className={`rounded-lg px-4 py-2.5 text-sm font-semibold capitalize focus-visible:outline-2 focus-visible:outline-amber-400 ${tab === value ? "bg-amber-400 text-slate-950" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>{value === "campaigns" ? <span className="inline-flex items-center gap-2"><Layers3 size={16}/> Campaigns</span> : <span className="inline-flex items-center gap-2"><ListChecks size={16}/> Leads</span>}</button>)}
              </div>
              <label className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 focus-within:border-amber-400"><Search className="text-slate-400" size={17}/><input aria-label="Filter displayed records" value={term} onChange={e => setTerm(e.target.value)} placeholder="Filter current page…" className="w-48 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-500 sm:w-60"/></label>
            </div>
            {tab === "leads" && campaign && <div className="my-5 flex flex-wrap items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-sm"><span>Showing leads from <strong>{campaign.name}</strong></span><button type="button" onClick={() => { setCampaign(null); setSelectedLeadId(null); setLeadPage(1); }} className="ml-auto inline-flex items-center gap-2 rounded-lg px-3 py-2 text-amber-300 hover:bg-white/5"><FilterX size={16}/> Clear filter</button></div>}
            {active.isLoading && <div role="status" className="flex items-center gap-3 py-14 text-slate-400"><LoaderCircle className="animate-spin" size={19}/> Loading {tab}…</div>}
            {active.isError && <div className="mt-6"><Failure error={active.error} retry={reload}/></div>}
            {active.isSuccess && <>
              {items.length === 0 ? <div className="mt-6"><Empty message={term ? "No matching records on this page. Clear the filter to see all." : `No ${tab} available with your permissions yet.`}/></div>
              : <div className="mt-5 grid gap-3">
                {items.map(item => tab === "campaigns"
                  ? <button type="button" onClick={() => selectCampaign(item as Campaign)} key={item.id} className="group flex w-full flex-wrap items-center gap-5 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-5 text-left transition hover:border-amber-400/50 hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-amber-400">
                    <span className="rounded-lg bg-amber-400/10 p-3 text-amber-300"><Building2 size={23}/></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm text-slate-400">{(item as Campaign).code}</span><span className="mt-1 block truncate text-base font-semibold">{item.name}</span></span>
                    <StateBadge state={(item as Campaign).state}/><ArrowRight size={19} className="text-amber-300 transition group-hover:translate-x-1"/>
                  </button>
                  : <div key={item.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                    <button type="button" aria-expanded={selectedLeadId === item.id}
                      aria-controls={`lead-details-${item.id}`}
                      onClick={() => setSelectedLeadId(selectedLeadId === item.id ? null : item.id)}
                      className="flex w-full flex-wrap items-center gap-4 px-5 py-5 text-left transition hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-amber-400">
                      <span className="rounded-lg bg-white/5 p-3 text-slate-300"><ListChecks size={22}/></span>
                      <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{item.name}</span><span className="mt-1 block text-sm text-slate-400">Lead #{item.id} · Campaign #{(item as Lead).campaign_id}</span></span>
                      <StateBadge state={(item as Lead).queue_state}/>
                      <ArrowRight size={18} className={`text-amber-300 transition-transform ${selectedLeadId === item.id ? "rotate-90" : ""}`}/>
                    </button>
                    {selectedLeadId === item.id && <div id={`lead-details-${item.id}`} className="grid gap-4 border-t border-white/10 bg-black/10 px-5 py-5 text-sm sm:grid-cols-3">
                      <div><p className="text-slate-400">Queue status</p><p className="mt-1 font-semibold">{stateLabel((item as Lead).queue_state)}</p></div>
                      <div><p className="text-slate-400">Priority</p><p className="mt-1 font-semibold">{(item as Lead).priority || "Normal"}</p></div>
                      <div><p className="text-slate-400">Assigned to your Odoo identity</p><p className="mt-1 font-semibold">{(item as Lead).assigned_to_me ? "Yes" : "No"}</p></div>
                      <p className="sm:col-span-3 text-slate-400">Read-only preview. Edits and communication actions are restricted to the governed Odoo workflow.</p>
                    </div>}
                  </div>
                )}
              </div>}
              <div className="mt-6"><Pager page={currentPage} total={total} back={() => tab === "campaigns" ? setCampaignPage(Math.max(1, campaignPage - 1)) : (setSelectedLeadId(null), setLeadPage(Math.max(1, leadPage - 1)))} next={() => tab === "campaigns" ? setCampaignPage(campaignPage + 1) : (setSelectedLeadId(null), setLeadPage(leadPage + 1))}/></div>
            </>}
          </section>
          <p className="mt-5 text-sm leading-relaxed text-slate-500">Read-only dashboard. To create leads, import lists, reassign agents, or run campaign lifecycle actions, use the protected Odoo CRM application. Those actions are intentionally not enabled through the public website.</p>
        </>}
      </div>
    </main>
  );
}
