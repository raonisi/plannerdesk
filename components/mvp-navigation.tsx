import Link from "next/link";
import type { ReactNode } from "react";

const text = {
  nextAction: "\ub2e4\uc74c \uc2e4\ubb34 \ub3d9\uc791",
  draftTitle: "\uac80\uc218 \ubc0f \ucd08\uc548 \uc548\ub0b4",
  draftBody:
    "\uc774 MVP\ub294 \ud544\uc694\ud55c \uacbd\uc6b0 \ucd08\uc548 placeholder \ub370\uc774\ud130\ub97c \uc0ac\uc6a9\ud569\ub2c8\ub2e4. \uacf5\uc2dd \ub9c1\ud06c, \uc5f0\ub77d\ucc98, \ud329\uc2a4\ubc88\ud638, \uc8fc\uc18c, \uc0c1\ud488 \ucc38\uc870, \ubb38\uc11c \ub9c1\ud06c\ub294 \uacf5\uac1c \uc804 \uac80\uc218\ub418\uc5b4\uc57c \ud569\ub2c8\ub2e4.",
  safetyTitle: "MVP \uc5c5\ubb34 \ubc94\uc704 \uc548\ub0b4",
  safetyA:
    "\uccad\uad6c \uad00\ub828 \uc815\ubcf4\uc640 \uc57d\uad00 \uad00\ub828 \uc815\ubcf4\ub294 \uc2e4\ubb34 \ucc38\uace0\uc6a9\uc785\ub2c8\ub2e4. \ucd5c\uc885 \uae30\uc900\uc740 \ubcf4\ud5d8\uc0ac, \ud611\ud68c, \uc57d\uad00, \uacf5\uc2dd \uacf5\uc2dc\uc640 \uac1c\ubcc4 \uc2ec\uc0ac \uae30\uc900\uc744 \ud655\uc778\ud574\uc57c \ud569\ub2c8\ub2e4.",
  safetyB:
    "\uace0\uac1d \uc548\ub0b4 \ubb38\uad6c\ub294 \ubc1c\uc1a1 \uc804 \uace0\uac1d \uc0c1\ud669, \uc0c1\ud488 \uae30\uc900, \ubcf4\ud5d8\uc0ac \uae30\uc900, \uad00\ub828 \uaddc\uc815\uc5d0 \ub9de\uac8c \uac80\ud1a0\ud558\uace0 \uc218\uc815\ud574\uc57c \ud569\ub2c8\ub2e4.",
  noPayoutJudge:
    "\ud50c\ub798\ub108\ub370\uc2a4\ud06c\ub294 \ubcf4\ud5d8\uae08 \uc9c0\uae09 \uc5ec\ubd80\ub97c \ud310\ub2e8\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.",
  noPayoutEstimate:
    "\ud50c\ub798\ub108\ub370\uc2a4\ud06c\ub294 \ubcf4\ud5d8\uae08 \uc9c0\uae09 \uae08\uc561\uc744 \uc0b0\uc815\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.",
  noAdjusting:
    "\ud50c\ub798\ub108\ub370\uc2a4\ud06c\ub294 \uc190\ud574\uc0ac\uc815 \uc5c5\ubb34\ub97c \uc218\ud589\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.",
  noMedicalDocs:
    "\ud604\uc7ac MVP\uc5d0\uc11c\ub294 \uace0\uac1d \uc758\ub8cc\uc11c\ub958\ub97c \ucc98\ub9ac\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4."
};

export type MvpLinkItem = {
  href: string;
  label: string;
  description: string;
};

export function MvpModuleLinks({
  description,
  items,
  title = text.nextAction
}: {
  description?: string;
  items: MvpLinkItem[];
  title?: string;
}) {
  return (
    <section className="border border-[#d9c9a8] bg-[#fbf7ee] p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7a612d]">
            Workflow links
          </p>
          <h2 className="mt-2 break-keep text-2xl font-semibold text-[#102235]">
            {title}
          </h2>
        </div>
        {description ? (
          <p className="max-w-xl break-keep text-sm leading-6 text-[#4f5661]">
            {description}
          </p>
        ) : null}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <Link
            className="group border border-[#e3d5b8] bg-white p-4 transition hover:border-[#aa8137]"
            href={item.href}
            key={item.href}
          >
            <span className="block break-keep text-base font-semibold text-[#102235] group-hover:text-[#7a612d]">
              {item.label}
            </span>
            <span className="mt-2 block break-keep text-sm leading-6 text-[#4f5661]">
              {item.description}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function MvpDraftNotice({ children }: { children?: ReactNode }) {
  return (
    <aside className="border border-[#d9c9a8] bg-[#fbf7ee] p-5 sm:p-6">
      <p className="text-sm font-semibold text-[#102235]">{text.draftTitle}</p>
      <p className="mt-2 break-keep text-sm leading-6 text-[#4f5661]">
        {children ?? text.draftBody}
      </p>
    </aside>
  );
}

export function MvpSafetyNotice() {
  return (
    <section className="border border-[#d9c9a8] bg-[#fbf7ee] p-5 sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7a612d]">
        Safety boundary
      </p>
      <h2 className="mt-2 break-keep text-2xl font-semibold text-[#102235]">
        {text.safetyTitle}
      </h2>
      <div className="mt-4 grid gap-3 text-sm leading-6 text-[#4f5661] md:grid-cols-2">
        <p>{text.safetyA}</p>
        <p>{text.safetyB}</p>
      </div>
      <ul className="mt-5 grid gap-2 text-sm leading-6 text-[#4f5661] md:grid-cols-2">
        <li>{text.noPayoutJudge}</li>
        <li>{text.noPayoutEstimate}</li>
        <li>{text.noAdjusting}</li>
        <li>{text.noMedicalDocs}</li>
      </ul>
    </section>
  );
}
