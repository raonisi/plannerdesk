import type { PublicInsurer } from "@/lib/public/insurers";
import { resolveInsurerLogoPublicSrc } from "@/lib/public/public-asset-policy";

export { INSURER_LOGO_SOURCES } from "@/lib/directory/insurer-logo-sources";

export function insurerLogoLabel(name: string) {
  const compactName = name.replace(/\s+/g, "");
  const latinMatch = compactName.match(/[A-Za-z]+/);

  if (latinMatch?.[0]) {
    return latinMatch[0].slice(0, 2).toUpperCase();
  }

  return compactName.slice(0, 2);
}

export function insurerLogoMatchKey(insurer: PublicInsurer) {
  const urls = [
    insurer.officialWebsiteUrl,
    insurer.systemUrl,
    insurer.plannerPortalUrl,
  ];
  const hostnames = urls.flatMap((url) => {
    if (!url) return [];

    try {
      const parsedUrl = new URL(url);
      return [parsedUrl.hostname.replace(/^www\./, ""), url];
    } catch {
      return [url];
    }
  });

  return [insurer.id, ...hostnames].join(" ").toLowerCase();
}

export function insurerLogoSrc(insurer: PublicInsurer) {
  return resolveInsurerLogoPublicSrc(insurer.id);
}
