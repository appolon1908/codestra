/** Policy access must not submit a form or imply SMS consent. */
export default function FormLegalLinks() {
  return <p className="text-sm leading-6" data-form-legal-links>
    Review our <a className="underline" href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
    {' and '}<a className="underline" href="/terms" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a>.
    {' '}Submitting this form does not opt you into SMS marketing.
  </p>;
}
