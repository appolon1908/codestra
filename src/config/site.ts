export const HORIZON_CONTRACT = Object.freeze({
  repository: "appolon1908-hue/SDK-repository",
  pullRequest: 73,
  commit: "7db4c6549a0a007922355090f03c082a308f3855",
  branch: "feature/horizon-unified-experience-v1",
});

export const SITE = Object.freeze({
  brand: "Codestra",
  legalName: "Codestra SRL",
  domainLabel: "codestra.co",
  canonicalUrl: "https://codestra.co",
  supportEmail: "support@codestra.co",
  phoneDominicanRepublic: "+1 809-734-7580",
  phoneUnitedStates: "+1 346-544-6979",
  domains: Object.freeze({
    public: "https://codestra.co",
    identity: "https://auth.codestra.co",
    api: "https://api.codestra.co",
    social: "https://social.codestra.co",
    automation: "https://automation.codestra.co",
  }),
  primaryNavigation: Object.freeze([
    { label: "Home", to: "/" },
    { label: "Services", to: "/services" },
    { label: "Case studies", to: "/case-studies" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ]),
  productNetwork: Object.freeze([
    { label: "Breero", href: "https://breero.com" },
    { label: "Beyvra", href: "https://beyvra.com" },
    { label: "Telnexa", href: "https://telnexa.co" },
    { label: "Klyrow", href: "https://klyrow.com" },
    { label: "Codestra Social", href: "https://social.codestra.co" },
  ]),
});
