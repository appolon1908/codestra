import { ArrowLeft, Search } from 'lucide-react'
import { Link } from 'react-router'
const NotFound = () => <section className="empty-page"><Search size={40} /><p className="eyebrow">404</p><h1>This page moved—or never existed.</h1><p>Use the navigation above or head back to the homepage.</p><Link className="button button-primary" to="/"><ArrowLeft size={17} />Back to home</Link></section>
export default NotFound
