import { FormEvent, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const ElectronicBillingForm = () => {
  const [complete, setComplete] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setComplete(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  if (complete) return <section className="empty-page"><CheckCircle2 size={44} className="accent-icon" /><p className="eyebrow">Request received</p><h1>Your billing consultation is on its way.</h1><p>Our team will review the details and follow up with the next practical step.</p><div className="button-row"><Link className="button button-primary" to="/auth/dashboard">Go to dashboard <ArrowRight size={17} /></Link><Link className="button button-secondary" to="/electronic-billing">Back to billing</Link></div></section>
  return <section className="section-pad page-hero"><div className="page-wrap form-page">
    <div><Link className="back-link" to="/electronic-billing"><ArrowLeft size={16} />Electronic billing</Link><p className="eyebrow">Project brief</p><h1>Tell us how billing works today.</h1><p className="hero-copy">A few operational details help us prepare a useful first conversation.</p></div>
    <form className="modern-form" onSubmit={submit}>
      <label>Company name<input name="company" autoComplete="organization" required /></label>
      <div className="form-row"><label>Contact name<input name="name" autoComplete="name" required /></label><label>Work email<input name="email" type="email" autoComplete="email" required /></label></div>
      <label>Approximate invoices per month<select name="volume" required defaultValue=""><option value="" disabled>Select a range</option><option>Under 100</option><option>100–1,000</option><option>1,001–10,000</option><option>More than 10,000</option></select></label>
      <label>Current accounting or ERP system<input name="system" placeholder="For example: Odoo, QuickBooks, SAP" /></label>
      <label>What needs to improve?<textarea name="goals" rows={5} required placeholder="Describe the current process, bottlenecks, and desired outcome." /></label>
      <label className="checkbox-label"><input type="checkbox" required />I agree to be contacted about this request.</label>
      <button className="button button-primary" type="submit">Submit project brief <ArrowRight size={17} /></button>
    </form>
  </div></section>
}
export default ElectronicBillingForm
