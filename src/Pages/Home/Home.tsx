import { ArrowRight, Boxes, Network, ScanSearch } from 'lucide-react'
import { Link } from 'react-router'
import heroImage from '../../assets/codestra-system-hero.png'
import logo from '../../assets/logo.png'

const capabilities = [
  { icon: ScanSearch, title: 'Strategy', copy: 'We align goals, processes, and technology into a clear roadmap that creates lasting impact.' },
  { icon: Boxes, title: 'Software', copy: 'We build reliable, scalable applications tailored to your business and your customers.' },
  { icon: Network, title: 'Automation', copy: 'We connect systems to reduce manual work, improve accuracy, and unlock useful data.' },
]

const Home = () => <>
  <section className="home-hero">
    <div className="page-wrap hero-grid">
      <div className="codestra-hero-copy">
        <p className="eyebrow">Connected business systems</p>
        <h1>Systems that <span>move</span> your business <em>forward</em></h1>
        <p className="hero-copy">Strategy, software, and automation—designed as one connected operation.</p>
        <div className="button-row">
          <Link className="button button-primary" to="/contact/sales">Talk to our team <ArrowRight size={18} /></Link>
          <Link className="button button-secondary" to="/services">Explore services <ArrowRight size={18} /></Link>
        </div>
      </div>
      <img className="hero-system-image" src={heroImage} alt="Abstract connected systems architecture" />
    </div>
  </section>

  <section className="proof-strip section-border">
    <div className="page-wrap proof-inner"><img className="pixel-mark" src={logo} alt="" /><p>Trusted by growing companies to build connected systems that scale.</p><Link to="/about">About Codestra <ArrowRight size={17} /></Link></div>
  </section>

  <section className="section-pad">
    <div className="page-wrap">
      <div className="section-heading"><p className="eyebrow">Built to work together</p><h2>One partner from direction to delivery.</h2><p>We bring strategy, software, and automation together to eliminate friction and accelerate what’s next.</p></div>
      <div className="feature-grid">
        {capabilities.map(({ icon: Icon, title, copy }, index) => <article className="feature" key={title}><Icon className="feature-icon" aria-hidden="true" /><span className="feature-index">0{index + 1}</span><h3>{title}</h3><p>{copy}</p><Link to="/services">Learn more <ArrowRight size={16} /></Link></article>)}
      </div>
    </div>
  </section>

  <section className="section-light section-pad">
    <div className="page-wrap outcome-layout"><div><p className="eyebrow">A practical approach</p><h2>Start with the business. Build only what matters.</h2></div><div><p>We map the work, identify the highest-impact opportunities, and deliver in clear stages. You see progress early and keep control of the roadmap.</p><Link className="inline-link" to="/case-studies">See how we work <ArrowRight size={17} /></Link></div></div>
  </section>

  <section className="cta-band"><div className="page-wrap cta-band-inner"><div><p className="eyebrow">Have a complex operation?</p><h2>Let’s make the next move clear.</h2></div><Link className="button button-primary" to="/contact/sales">Start a conversation <ArrowRight size={17} /></Link></div></section>
</>

export default Home
