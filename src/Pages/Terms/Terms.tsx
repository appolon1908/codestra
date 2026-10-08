import Navbar from '../../Components/Layouts/Navbar';
import Footer from '../../Components/Layouts/Footer';

export default function Terms() {
  return <><Navbar /><main className="mx-auto max-w-4xl px-6 pt-40 text-sm leading-7">
    <h1 className="mb-6 text-3xl">Website and Messaging Terms</h1>
    <p className="mb-4">This website is operated by CODESTRA LLC. Website enquiries do not create a service contract or a commitment to purchase. Paid services are governed by the separate agreement accepted for that service.</p>
    <h2 className="mb-3 mt-6 text-xl">Chat and text-message consent</h2>
    <p className="mb-4">Our chat widget lets you request information or support. Providing a phone number alone is not permission for marketing. Review the consent choices and disclosures displayed in the widget before submitting. Consent is not a condition of purchase.</p>
    <p className="mb-4">Where you separately opt into an available CODESTRA messaging program, message frequency varies. Message and data rates may apply. Reply STOP to stop text messages and HELP for assistance, or contact support@codestra.co. Carriers are not liable for delayed or undelivered messages.</p>
    <p className="mb-4">Do not submit payment-card details, passwords, medical records, or other sensitive documents through chat. Use the appropriate secure service channel instead.</p>
    <h2 className="mb-3 mt-6 text-xl">Privacy and support</h2>
    <p className="mb-4">See our <a className="underline" href="/privacy">Privacy Policy</a> for information handling. Questions about these terms, privacy, or messaging can be sent to <a className="underline" href="mailto:support@codestra.co">support@codestra.co</a>.</p>
    <p>Last updated: October 8, 2026.</p>
  </main><Footer /></>;
}
