import type { ReactNode } from 'react'
import Footer from './Footer'
import Navbar from './Navbar'

interface MarketingLayoutProps {
  children: ReactNode
  className?: string
}

const MarketingLayout = ({ children, className = '' }: MarketingLayoutProps) => (
  <div className={`marketing-site ${className}`.trim()}>
    <Navbar />
    <main id="main-content">{children}</main>
    <Footer />
  </div>
)

export default MarketingLayout
