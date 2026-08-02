import Footer from '../../Components/Layouts/Footer'
import Navbar from '../../Components/Layouts/Navbar'

const Privacy = () => (
  <>
    <Navbar />
    <main className="2xl:px-[25rem] xl:px-[10rem] lg:px-[8rem] px-5 pt-[10rem] text-sm leading-7">
      <h1 className="text-3xl mb-6">Privacy Policy</h1>
      <p className="mb-4">Codestra uses the information you submit to respond to requests, provide services, maintain account security, and meet legal obligations.</p>
      <p className="mb-4">Form information may be stored in Codestra systems and synchronized with our customer relationship platform. We do not sell personal information.</p>
      <p className="mb-4">To request access, correction, or deletion of your information, email <a className="text-[#FFD700]" href="mailto:support@codestra.co">support@codestra.co</a>.</p>
      <p>Last updated: August 2, 2026.</p>
    </main>
    <Footer />
  </>
)

export default Privacy
