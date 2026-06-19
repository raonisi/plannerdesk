import { sectionEyebrow, textStyles } from "@/lib/design-system";

export function SectionHeader({
  eyebrow,
  title,
  description,
  id,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
}) {
  return (
    <header className="max-w-3xl">
      {eyebrow ? <p className={sectionEyebrow}>{eyebrow}</p> : null}
      <h2
        id={id}
        className={`${eyebrow ? "mt-2" : ""} break-keep text-xl font-bold text-[#0F1D2E] sm:text-2xl`}
      >
        {title}
      </h2>
      {description ? (
        <p className={`mt-2 break-keep ${textStyles.small}`}>{description}</p>
      ) : null}
    </header>
  );
}
