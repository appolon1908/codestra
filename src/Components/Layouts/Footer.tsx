import logo from '../../assets/logo.png'
const Footer = () => {
  return (
    <div className="flex lg:flex-row flex-col lg:gap-14 gap-8 text-sm 2xl:px-[25rem] xl:px-[10rem] lg:px-[5rem] px-8 bg-[#08090A] border-t border-neutral-800 lg:py-20 pt-10 pb-10 lg:mt-[10rem] mt-[5rem] justify-between">
      
      <div>
        <h2 className="text-base text-white font-bold">Offices</h2>
        <div className="text-sx">
          <div className="pb-3 pt-3 border-b border-neutral-800">
            <p className="pb-2">809-734-7580</p>
            <p>Codestra, Condominio Progreso Business Center, Av. Lope de Vega 13, Santo Domingo 10130</p>
          </div>

          <div className="pb-3 pt-3 border-b border-neutral-800">
            <p className="pb-2">+1 346-544-6979</p>
            <p>20634 Longen Baugh RD Cypress TX, USA 77433-77433</p>
          </div>

          <div className="pb-3 pt-3 ">
            <p>support@codestra.com</p>

            <div className='pt-4'>
              <img src={logo} alt="" className='w-24'/>
            </div>

            <div className="pt-5">
              <p className='pb-3'>"Craftsmanship in Every Line of  Code."</p>
              <p>Development used to be magical—an art that inspired <br /> innovation and transformed ideas into reality.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex lg:flex-row flex-col lg:gap-28 gap-8 text-white">
        <ul className="space-y-5 text-sm lg:border-none border-t lg:pt-0 pt-5 border-neutral-800">
          <li className="text-base text-white font-bold">Services</li>
          <li className="cursor-pointer">Software Development</li>
          <li className="cursor-pointer">Mobile App Development</li>
          <li className="cursor-pointer">AI Development</li>
          <li className="cursor-pointer">Software Consulting</li>
          <li className="cursor-pointer">UI/UX Design</li>
          <li className="cursor-pointer">Web Design</li>
          <li className="cursor-pointer">Branding</li>
        </ul>

        <ul className="space-y-5 lg:border-none border-t lg:pt-0 pt-5 border-neutral-800">
          <li className="text-base text-white font-bold">Industries</li>
          <li className="cursor-pointer">Finance</li>
          <li className="cursor-pointer">Healthcare</li>
          <li className="cursor-pointer">iGaming</li>
          <li className="cursor-pointer">Real Estate</li>
          <li className="cursor-pointer">Education</li>
          <li className="cursor-pointer">Web Design</li>
          <li className="cursor-pointer">Web3 & Blockchain</li>
        </ul>

        <ul className="space-y-5 lg:border-none border-t lg:pt-0 pt-5 border-neutral-800">
          <li className="text-base text-white font-bold">Company</li>
          <li className="cursor-pointer">About</li>
          <li className="cursor-pointer">Contact</li>
          <li className="cursor-pointer">Our Work</li>
          <li className="cursor-pointer">Privacy Policy</li>
        </ul>
      </div>
    </div>
  )
}

export default Footer