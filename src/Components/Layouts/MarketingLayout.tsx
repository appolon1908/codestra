import '../../Pages/Home/modern-shell.css'
import type { ReactNode } from 'react'
import Footer from './Footer'
import Navbar from './Navbar'

interface MarketingLayoutProps {
  children: ReactNode
  className?: string
}

const MarketingLayout = ({ children, className = '' }: MarketingLayoutProps) => (
  <div className={`modern-shell marketing-site ${className}`.trim()}>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <Navbar />
    <main lang="en" id="main-content">{children}</main>
    <Footer />
  </div>
)

export default MarketingLayout
