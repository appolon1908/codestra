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
      <h2 className="mb-3 mt-6 text-xl">Website chat and messaging</h2>
      <p className="mb-4">Information submitted through our chat widget is processed by HighLevel / LeadConnector to deliver the chat service and may be stored in Codestra systems for enquiry review and support. Submit only information needed for your enquiry; do not send passwords, payment-card details, or medical records through chat.</p>
      <p className="mb-4">A phone number or a chat enquiry alone is not marketing consent. We do not sell SMS opt-in data or consent records, or share them with third parties for their own marketing. Service providers may process this information only to deliver services on our behalf.</p>
      <p className="mb-4">Messaging choices are shown in the widget. You can withdraw text-message consent by replying STOP, and request help by replying HELP or emailing support@codestra.co. See our <a className="underline" href="/terms">Website and Messaging Terms</a>.</p>
      <p>Last updated: October 8, 2026.</p>
    </main>
    <Footer />
  </>
)

export default Privacy
