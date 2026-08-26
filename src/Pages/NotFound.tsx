import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import Footer from '../Components/Layouts/Footer'
import Navbar from '../Components/Layouts/Navbar'
import PageMeta from '../Components/SEO/PageMeta'

const NotFound = () => (
  <>
    <PageMeta
      title="Page Not Found | Codestra"
      description="The requested Codestra page could not be found."
      path={window.location.pathname}
      robots="noindex, follow"
    />
    <Navbar />
    <main id="main-content" className="not-found shell">
      <p className="eyebrow">404 · Page not found</p>
      <h1>This page is no longer on the map.</h1>
      <p>Return to Codestra’s homepage or start a conversation about your AI, automation or software project.</p>
      <Link className="button button--gold" to="/"><ArrowLeft size={18} aria-hidden="true" /> Back to home</Link>
    </main>
    <Footer />
  </>
)

export default NotFound
