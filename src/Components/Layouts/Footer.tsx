
const Footer = () => {
  return (
    <div className="flex lg:flex-row flex-col gap-8 text-sm lg:px-[25rem] px-10 bg-[#08090A] border-t border-neutral-800 lg:py-20 pt-10 lg:mt-[10rem] mt-[5rem] justify-between">
      <h2 className="text-base text-white font-bold">Calender</h2>

      <div className="flex lg:flex-row flex-col lg:gap-28 gap-8 text-[#B4B5B5]">
        <ul className="space-y-5 lg:border-none border-t lg:pt-0 pt-5 border-neutral-800">
          <li className="text-base text-white font-bold">Services</li>
          <li className="cursor-pointer">Branding</li>
          <li className="cursor-pointer">AI Development</li>
          <li className="cursor-pointer">UI/UX Design</li>
          <li className="cursor-pointer">Web Design</li>
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