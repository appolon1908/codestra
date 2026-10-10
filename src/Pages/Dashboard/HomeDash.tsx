import { Link, useNavigate } from "react-router";
import { ArrowRight, Building2, LogOut, ShieldCheck } from "lucide-react";
import { useSession } from "@/Providers/SessionProvider";

export default function HomeDash() {
  const navigate = useNavigate();
  const { logout: endSession } = useSession();
  const logout = async () => { await endSession(); navigate("/login", { replace: true }); };
  return (
    <main className="min-h-screen bg-[#080b13] text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5 md:px-12">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="rounded-xl bg-amber-400/15 p-2 text-amber-300"><Building2 size={24}/></span>
          Codestra <span className="font-normal text-slate-400">Operations</span>
        </Link>
        <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-amber-400"><LogOut size={17}/> Sign out</button>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-14 md:px-12">
        <div className="mb-10 flex items-center gap-2 text-sm text-emerald-300"><ShieldCheck size={18}/> Protected staff workspace</div>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">Operations that stay connected.</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-400">Open the CRM workspace to inspect campaign state and assigned leads from the live Odoo 20 backend. Sensitive records require staff authorization; unavailable connections are shown explicitly.</p>
        <Link to="/auth/dashboard/crm" className="mt-9 inline-flex items-center gap-4 rounded-xl bg-amber-400 px-6 py-4 font-semibold text-slate-950 transition hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-white">
          Open CRM workspace <ArrowRight size={20}/>
        </Link>
        <div className="mt-14 grid gap-4 md:grid-cols-2">
          <Link to="/auth/dashboard/crm" className="group rounded-2xl border border-white/10 bg-white/5 p-7 transition hover:border-amber-400/70 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-amber-400">
            <Building2 className="mb-4 text-amber-300" size={28}/><h2 className="text-xl font-semibold">Campaign overview</h2><p className="mt-2 text-slate-400">Browse campaigns, inspect status, select a campaign and switch to its leads.</p><span className="mt-6 inline-flex items-center gap-2 text-amber-300">Explore <ArrowRight size={16}/></span>
          </Link>
          <Link to="/auth/dashboard/crm" className="group rounded-2xl border border-white/10 bg-white/5 p-7 transition hover:border-amber-400/70 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-amber-400">
            <ShieldCheck className="mb-4 text-amber-300" size={28}/><h2 className="text-xl font-semibold">Lead visibility</h2><p className="mt-2 text-slate-400">Read role-scoped queues through the authenticated Codestra API proxy.</p><span className="mt-6 inline-flex items-center gap-2 text-amber-300">View leads <ArrowRight size={16}/></span>
          </Link>
        </div>
      </div>
    </main>
  );
}
