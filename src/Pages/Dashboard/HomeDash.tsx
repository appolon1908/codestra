import { ArrowRight, CheckCircle2, Clock3, FolderKanban, Headphones, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const HomeDash = () => {
  const navigate = useNavigate()
  const logout = () => { localStorage.removeItem('accessToken'); navigate('/') }
  return <section className="dashboard section-pad"><div className="page-wrap">
    <div className="dashboard-heading"><div><p className="eyebrow">Client workspace</p><h1>Good to see you.</h1><p>Track active work, find support, and keep the next action clear.</p></div><button className="button button-secondary" onClick={logout}><LogOut size={17} />Log out</button></div>
    <div className="dashboard-grid">
      <article className="dashboard-panel featured-panel"><div><span className="status"><Clock3 size={15} />Discovery</span><h2>Your transformation plan</h2><p>Complete the project brief so our team can prepare a focused working session.</p></div><Link className="button button-primary" to="/electronic-billing/form">Continue brief <ArrowRight size={17} /></Link></article>
      <article className="dashboard-panel"><FolderKanban /><h2>Projects</h2><p>Your new projects and shared milestones will appear here.</p><Link to="/contact/sales">Start a project <ArrowRight size={16} /></Link></article>
      <article className="dashboard-panel"><Headphones /><h2>Support</h2><p>Tell our team what is blocked and get the right help.</p><Link to="/contact/support">Contact support <ArrowRight size={16} /></Link></article>
      <article className="dashboard-panel"><CheckCircle2 /><h2>Account security</h2><p>Your active session is protected. Sign out on shared devices.</p><button className="text-button" onClick={logout}>End this session <ArrowRight size={16} /></button></article>
    </div>
  </div></section>
}
export default HomeDash
