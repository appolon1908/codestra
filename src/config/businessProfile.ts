export type BusinessProfile = {
  brand: string;
  websiteUrl: string;
  currency: "USD";
  operatingTimezone: "America/New_York";
  operatingTimezoneLabel: "Eastern Time (ET)";
  language: "en-US";
  legalOperator: { name: "Codestra LLC"; jurisdiction: "United States" };
  affiliate: { name: "Codestra SRL"; jurisdiction: "Dominican Republic" };
  mainOffice: { street: string; city: string; region: string; postalCode: string; country: string };
  supportEmail: string;
  privacyEmail: string;
  securityEmail: string;
  smsProgramEmail: string;
  supportPhone: null;
  supportHours: null;
  policy: { effectiveDate: string; lastUpdated: string; version: string };
};

export const businessProfile: BusinessProfile = {
  brand: "Codestra",
  websiteUrl: "https://codestra.co",
  currency: "USD",
  operatingTimezone: "America/New_York",
  operatingTimezoneLabel: "Eastern Time (ET)",
  language: "en-US",
  legalOperator: { name: "Codestra LLC", jurisdiction: "United States" },
  affiliate: { name: "Codestra SRL", jurisdiction: "Dominican Republic" },
  mainOffice: {
    street: "20634 Longenbaugh Rd",
    city: "Cypress",
    region: "Texas",
    postalCode: "77433",
    country: "United States",
  },
  supportEmail: "support@codestra.co",
  privacyEmail: "support@codestra.co",
  securityEmail: "support@codestra.co",
  smsProgramEmail: "support@codestra.co",
  supportPhone: null,
  supportHours: null,
  policy: { effectiveDate: "2026-08-17", lastUpdated: "2026-08-17", version: "2026.08" },
};

export const formatMainOffice = () => {
  const { street, city, region, postalCode, country } = businessProfile.mainOffice;
  return `${street}, ${city}, ${region} ${postalCode}, ${country}`;
};
