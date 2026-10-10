import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/Pages/ElectronicBilling/ElectronicBilling.tsx', 'utf8');

describe('billing enquiries are not SMS opt-ins', () => {
  it('leaves the reply request unchecked initially and after reset', () => {
    expect(source).not.toContain('consent_to_contact: true');
    expect(source.match(/consent_to_contact:\s*false/g)).toHaveLength(2);
  });
  it('limits the reply request to email and explicitly excludes text messages', () => {
    expect(source).toContain('I request a reply by email about this enquiry. This does not opt me into text messages.');
  });
});
