import { useEffect } from 'react';
import Navbar from '../../Components/Layouts/Navbar';
import Footer from '../../Components/Layouts/Footer';
import content from './legalContent.json';

type LegalPageKind = 'privacy' | 'terms' | 'smsTerms' | 'sms' | 'contactInformation';
export default function LegalPage({ kind }: { kind: LegalPageKind }) {
  const page = content[kind];
  useEffect(() => {
    const previous = document.title;
    document.title = `${page.title} | ${content.business}`;
    return () => { document.title = previous; };
  }, [page.title]);
  return <><Navbar /><main className="mx-auto max-w-4xl px-6 pt-40 pb-12 text-sm leading-7">
    <h1 className="mb-6 text-3xl">{page.title}</h1>
    <p className="mb-4">{page.intro}</p>
    <p className="mb-6">Last updated: {content.updated}.</p>
    {page.sections.map(section => <section key={section.heading} className="mb-6">
      <h2 className="mb-3 text-xl">{section.heading}</h2>
      {section.paragraphs.map(paragraph => <p key={paragraph} className="mb-4">{paragraph}</p>)}
    </section>)}
    <address className="mb-6 not-italic">{content.business}<br />
      <a className="underline" href={`mailto:${content.email}`}>{content.email}</a><br />
      <a className="underline" href={content.phoneHref}>{content.phone}</a>
    </address>
    <nav aria-label="Policy and company links" className="flex flex-wrap gap-5">
      <a className="underline" href="/privacy">Privacy Policy</a>
      <a className="underline" href="/terms">Terms &amp; Conditions</a>
      <a className="underline" href="/sms-terms">SMS Terms</a>
      <a className="underline" href="/sms">SMS Updates</a>
      <a className="underline" href="/contact-information">Contact CODESTRA LLC</a>
      <a className="underline" href="/about">About Codestra</a>
    </nav>
  </main><Footer /></>;
}
