import type { PublicInsurer } from "@/lib/public/insurers";
import { resolveInsurerLogoPublicSrc } from "@/lib/public/public-asset-policy";

export const INSURER_LOGO_SOURCES: Array<{ tokens: string[]; src: string }> = [
  {
    tokens: ["samsung-fire", "samsungfire.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/samsung-fire.png",
  },
  {
    tokens: ["hanwha-general", "hwgeneralins.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/hanhwa-fire.png",
  },
  {
    tokens: ["hyundai-marine", "hi.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/hyundai-fire.png",
  },
  {
    tokens: ["meritz-fire", "meritzfire.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/meritz-fire.png",
  },
  {
    tokens: ["db-general", "db-insurance", "idbins.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/db-fire.png",
  },
  {
    tokens: ["kb-general", "kb-insurance", "kbinsure.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/kb-fire.png",
  },
  {
    tokens: ["heungkuk-fire", "heungkukfire.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/heungkuk-fire.png",
  },
  {
    tokens: ["nh-general", "nhfire.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/nh-fire.png",
  },
  {
    tokens: ["lotte-general", "lotte-fire", "lotteins.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/lotte-fire.png",
  },
  {
    tokens: ["aig-general", "aig.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/aig-fire.png",
  },
  {
    tokens: ["chubb-general", "lina-general", "chubb.com/kr-kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/lina-fire.png",
  },
  {
    tokens: ["yebyeol-general", "yebyeol-insurance", "yebyeol.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/yb-fire.png",
  },
  {
    tokens: ["hana-general", "hanainsure.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/fire/hana-fire.png",
  },
  {
    tokens: ["samsung-life", "samsunglife.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/samsung-life.png",
  },
  {
    tokens: ["hanwha-life", "hanwhalife.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/hanhwa-life.png",
  },
  {
    tokens: ["kyobo-life", "kyobo.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/kyobo-life.png",
  },
  {
    tokens: ["metlife", "metlife.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/met-life.png",
  },
  {
    tokens: ["nh-life", "nhlife.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/nh-life.png",
  },
  {
    tokens: ["shinhan-life", "shinhanlife.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/shinhan-life.png",
  },
  {
    tokens: ["kb-life", "kblife.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/kb-life.png",
  },
  {
    tokens: ["heungkuk-life", "heungkuklife.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/heungkuk-life.png",
  },
  {
    tokens: ["abl-life", "abllife.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/abl-life.png",
  },
  {
    tokens: ["miraeasset-life", "miraeasset.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/miraeasset-life.png",
  },
  {
    tokens: ["tongyang-life", "myangel.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/tongyang-life.png",
  },
  {
    tokens: ["kdb-life", "kdblife.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/kdb-life.png",
  },
  {
    tokens: ["db-life", "idblife.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/db-life.png",
  },
  {
    tokens: ["aia-life", "aia.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/aia-life.png",
  },
  {
    tokens: ["im-life", "dgbfnlife.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/im-life.png",
  },
  {
    tokens: ["lina-life", "lina.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/lina-life.png",
  },
  {
    tokens: ["chubb-life", "chubblife.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/chubb-life.png",
  },
  {
    tokens: ["hana-life", "hanalife.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/hana-life.png",
  },
  {
    tokens: ["bnp-life", "cardif.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/bnp-life.png",
  },
  {
    tokens: ["fubonhyundai-life", "fubonhyundai.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/life/fubon-life.png",
  },
  {
    tokens: ["woochegook-mutual", "wuchegook-gongje"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/gongje/wuchegook-gongje.png",
  },
  {
    tokens: ["suhyeop-mutual", "suhyup-gongje"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/gongje/suhyup-gongje.png",
  },
  {
    tokens: ["thek-mutual", "thek-gongje"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/gongje/thek-gongje.png",
  },
  {
    tokens: ["shinhyeop-mutual", "shinhyup-gongje"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/gongje/shinhyup-gongje.png",
  },
  {
    tokens: ["axa-insurance", "axa.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/digital/axa-digital.png",
  },
  {
    tokens: ["samsung-digital", "direct.samsungfire.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/digital/samsung-digital.png",
  },
  {
    tokens: ["kakaopay-digital", "kakaopayinscorp.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/digital/kakao-digital.png",
  },
  {
    tokens: ["kyobo-digital", "lifeplanet.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/digital/kyobo-digital%20(1).png",
  },
  {
    tokens: ["shinhanez-digital", "shinhanez.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/digital/shinhan-digital.png",
  },
  {
    tokens: ["carrot-digital", "carrotins.com"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/digital/carrot-digital.png",
  },
  {
    tokens: ["hanaoneday-digital", "day.hanainsure.co.kr"],
    src: "https://oomhivvzfyckwfubxveb.supabase.co/storage/v1/object/public/insurers_logo/digital/hana-digital.png",
  },
];

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
  const matchKey = insurerLogoMatchKey(insurer);

  const candidate =
    INSURER_LOGO_SOURCES.find(({ tokens }) =>
      tokens.some((token) => matchKey.includes(token)),
    )?.src ?? null;

  return resolveInsurerLogoPublicSrc(insurer, candidate);
}

