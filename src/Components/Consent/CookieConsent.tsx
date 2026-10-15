import { useEffect, useState } from "react";
import LocalizedLink from "../../i18n/LocalizedLink";
import { setAnalyticsConsent } from "../../Pages/AIReceptionist/analytics";

const KEY = "codestra_cookie_preferences_v1";
type Choice = { analytics: boolean; updatedAt: string; source: "banner" | "gpc" | "preferences" };
export const saveCookieChoice = (analytics: boolean, source: Choice["source"] = "preferences") => {
  const choice: Choice = { analytics, updatedAt: new Date().toISOString(), source };
  localStorage.setItem(KEY, JSON.stringify(choice));
  setAnalyticsConsent(analytics);
  window.dispatchEvent(new Event("codestra:consent-updated"));
};
export const readCookieChoice = (): Choice | null => { try { return JSON.parse(localStorage.getItem(KEY) ?? "null") as Choice | null; } catch { return null; } };

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [manage, setManage] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  useEffect(() => {
    const gpc = Boolean((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl);
    const saved = readCookieChoice();
    if (gpc && !saved) { saveCookieChoice(false, "gpc"); return; }
    if (!saved) setOpen(true);
  }, []);
  const save = (value: boolean) => { saveCookieChoice(value, "banner"); setOpen(false); setManage(false); };
  if (!open) return <button type="button" className="fixed bottom-4 left-4 z-[70] rounded-full border border-neutral-700 bg-[#151517] px-4 py-3 text-sm shadow-xl" onClick={() => { const saved=readCookieChoice(); setAnalytics(saved?.analytics ?? false); setManage(true); setOpen(true); }}>Cookie preferences</button>;
  return <div className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-3xl rounded-2xl border border-neutral-700 bg-[#111] p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="cookie-title"><h2 id="cookie-title" className="text-xl font-semibold">Your privacy choices</h2><p className="mt-2 text-sm leading-6 text-neutral-300">Codestra uses necessary browser storage for language, security and requested form context. Optional analytics stays off unless you allow it. Advertising is disabled.</p>{manage && <label className="mt-4 flex min-h-11 items-center gap-3 rounded-xl border border-neutral-700 p-3"><input type="checkbox" checked={analytics} onChange={(e)=>setAnalytics(e.target.checked)} /><span><strong>Analytics</strong><span className="block text-sm text-neutral-400">Helps measure page and form usage after consent.</span></span></label>}<div className="mt-5 flex flex-wrap gap-3"><button className="rounded-full bg-[#FFD700] px-5 py-3 font-semibold text-black" onClick={()=>save(true)}>Accept all</button><button className="rounded-full border border-neutral-600 px-5 py-3" onClick={()=>save(false)}>Reject nonessential</button>{manage ? <button className="rounded-full border border-neutral-600 px-5 py-3" onClick={()=>save(analytics)}>Save selection</button> : <button className="rounded-full border border-neutral-600 px-5 py-3" onClick={()=>setManage(true)}>Manage preferences</button>}</div><p className="mt-4 text-sm"><LocalizedLink className="text-[#FFD700] underline" to="/cookies">Cookie Policy</LocalizedLink></p></div>;
}
