import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { localeFromPath, localizePath } from "./locale-resolver";
import { supportedLocales } from "./locale-types";

const OG_LOCALE = { en: "en_US", es: "es_ES", fr: "fr_FR" } as const;

export default function LocalizedSeo() {
  const location = useLocation();
  const { t } = useTranslation(["seo", "industries"]);
  const locale = localeFromPath(location.pathname) ?? "en";
  const page = location.pathname.includes("ai-receptionist") ? "aiReceptionist" : location.pathname.includes("industries") ? "industries" : "default";
  useEffect(() => {
    const industrySlug = location.pathname.match(/\/industries\/([^/?#]+)/)?.[1];
    const industryName = industrySlug ? t(`industries:content.${industrySlug}.name`) : "";
    const industrySummary = industrySlug ? t(`industries:content.${industrySlug}.summary`) : "";
    const title = industrySlug ? t("seo:industries.detailTitle", { industry: industryName }) : t(`seo:${page}.title`);
    const description = industrySlug ? industrySummary : t(`seo:${page}.description`);
    const canonicalUrl = `https://codestra.co${location.pathname}`;
    document.title = title; document.documentElement.lang = locale;
    const meta = (selector: string, attrs: Record<string,string>) => {
      let node = document.head.querySelector<HTMLMetaElement>(selector);
      if (!node) { node = document.createElement("meta"); document.head.appendChild(node); }
      Object.entries(attrs).forEach(([key,value]) => node!.setAttribute(key,value));
    };
    meta('meta[name="description"]', {name:"description",content:description});
    meta('meta[property="og:title"]', {property:"og:title",content:title});
    meta('meta[property="og:description"]', {property:"og:description",content:description});
    meta('meta[property="og:url"]', {property:"og:url",content:canonicalUrl});
    meta('meta[property="og:locale"]', {property:"og:locale",content:OG_LOCALE[locale]});
    document.head.querySelectorAll('link[data-codestra-locale]').forEach((node) => node.remove());
    const addLink = (rel:string, href:string, hreflang?:string) => { const node=document.createElement("link"); node.rel=rel; node.href=href; node.dataset.codestraLocale="true"; if(hreflang) node.hreflang=hreflang; document.head.appendChild(node); };
    addLink("canonical", canonicalUrl);
    supportedLocales.forEach((lang) => addLink("alternate", `https://codestra.co${localizePath(location.pathname, lang)}`, lang));
    addLink("alternate", `https://codestra.co${localizePath(location.pathname, "en")}`, "x-default");
  }, [location.pathname, locale, page, t]);
  return null;
}
