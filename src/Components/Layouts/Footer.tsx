import { Link } from 'react-router'
import logo from '../../assets/logo.png'

const serviceLinks = ['Software Development', 'Mobile App Development', 'AI Development', 'Software Consulting', 'UI/UX Design', 'Web Design', 'Branding']
const industryLinks = ['Finance', 'Healthcare', 'iGaming', 'Real Estate', 'Education', 'Web3 & Blockchain']

const Footer = () => (
  <footer className="flex lg:flex-row flex-col lg:gap-14 gap-8 text-sm 2xl:px-[25rem] xl:px-[10rem] lg:px-[5rem] px-8 bg-[#08090A] border-t border-neutral-800 lg:py-20 pt-10 pb-10 lg:mt-[10rem] mt-[5rem] justify-between">
    <div>
      <h2 className="text-base text-white font-bold">Offices</h2>
      <div className="text-xs">
        <div className="pb-3 pt-3 border-b border-neutral-800">
          <a className="pb-2 block hover:text-[#FFD700]" href="tel:+18097347580">809-734-7580</a>
          <p>Codestra, Condominio Progreso Business Center, Av. Lope de Vega 13, Santo Domingo 10130</p>
        </div>
        <div className="pb-3 pt-3 border-b border-neutral-800">
          <a className="pb-2 block hover:text-[#FFD700]" href="tel:+13465446979">+1 346-544-6979</a>
          <p>20634 Longen Baugh RD Cypress TX, USA 77433</p>
        </div>
        <div className="pb-3 pt-3">
          <a className="hover:text-[#FFD700]" href="mailto:support@codestra.co">support@codestra.co</a>
          <Link to="/" className="block pt-4" aria-label="Codestra home"><img src={logo} alt="Codestra" className="w-24"/></Link>
          <div className="pt-5"><p className="pb-3">Craftsmanship in Every Line of Code.</p><p>We turn ideas into reliable digital products.</p></div>
        </div>
      </div>
    </div>
    <div className="flex lg:flex-row flex-col lg:gap-28 gap-8 text-white">
      <ul className="space-y-5 text-sm lg:border-none border-t lg:pt-0 pt-5 border-neutral-800">
        <li className="text-base font-bold">Services</li>
        {serviceLinks.map(item => <li key={item}><Link className="hover:text-[#FFD700]" to="/services">{item}</Link></li>)}
      </ul>
      <ul className="space-y-5 lg:border-none border-t lg:pt-0 pt-5 border-neutral-800">
        <li className="text-base font-bold">Industries</li>
        {industryLinks.map(item => <li key={item}><Link className="hover:text-[#FFD700]" to="/case-studies">{item}</Link></li>)}
      </ul>
      <ul className="space-y-5 lg:border-none border-t lg:pt-0 pt-5 border-neutral-800">
        <li className="text-base font-bold">Company</li>
        <li><Link className="hover:text-[#FFD700]" to="/about">About</Link></li>
        <li><Link className="hover:text-[#FFD700]" to="/contact">Contact</Link></li>
        <li><Link className="hover:text-[#FFD700]" to="/case-studies">Our Work</Link></li>
        <li><Link className="hover:text-[#FFD700]" to="/privacy">Privacy Policy</Link></li>
      </ul>
    </div>
  </footer>
)

export default Footer
