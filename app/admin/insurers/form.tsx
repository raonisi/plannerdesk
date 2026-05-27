import Link from "next/link";
import type { ReactNode } from "react";
import {
  CardPaymentStatus,
  ClaimFaxHandlingType,
  InsurerCategory,
  VerificationStatus,
  type Insurer,
} from "@prisma/client";
import { ADMIN_VISIBILITY_COPY } from "./visibility";

const fieldClass =
  "mt-1 w-full rounded-md border border-[#d9c9a8] bg-white px-3 py-2 text-sm text-[#102235] outline-none transition focus:border-[#1f6b55] focus:ring-2 focus:ring-[#1f6b55]/15";
const labelClass = "block text-sm font-semibold text-[#102235]";
const hintClass = "mt-1 text-xs leading-relaxed text-[#5f6875]";
const sectionClass =
  "rounded-lg border border-[#e7ddc9] bg-white p-5 shadow-sm sm:p-6";
const sectionTitleClass = "text-base font-semibold text-[#102235]";
const sectionDescClass = "mt-1 text-xs leading-relaxed text-[#5f6875]";

const NOTICE_TEXT =
  "\uacf5\uc2dd \ub9c1\ud06c\uc640 \uc5f0\ub77d\ucc98\ub294 \uacf5\uac1c \uc804 \ubc18\ub4dc\uc2dc \ubcf4\ud5d8\uc0ac \uacf5\uc2dd \ucd9c\ucc98 \uae30\uc900\uc73c\ub85c \uac80\uc218\ud574 \uc8fc\uc138\uc694.";
const SENSITIVE_NOTICE_TEXT =
  "\uace0\uac1d \uac1c\uc778\uc815\ubcf4, \uc758\ub8cc \ub370\uc774\ud130, \ubcf4\ud5d8\uae08 \uc9c0\uae09 \ud310\ub2e8, \uc190\ud574 \uc0ac\uc815 \uc758\uacac\uc740 \uc785\ub825\ud558\uc9c0 \ub9c8\uc138\uc694.";
const URL_PLACEHOLDER_OPTIONAL = "https://example.com";

const TRISTATE_OPTIONS = [
  { value: "", label: "\ud655\uc778 \ud544\uc694" },
  { value: "true", label: "\uac00\ub2a5" },
  { value: "false", label: "\ud574\ub2f9\uc0ac\ud56d \uc5c6\uc74c" },
];

const CARD_PAYMENT_STATUS_OPTIONS: { value: CardPaymentStatus; label: string }[] = [
  { value: CardPaymentStatus.available, label: "\uc0ac\uc6a9 \uac00\ub2a5" },
  { value: CardPaymentStatus.conditional, label: "\uc870\uac74\ubd80 \uc0ac\uc6a9" },
  { value: CardPaymentStatus.unavailable, label: "\ud574\ub2f9\uc0ac\ud56d \uc5c6\uc74c" },
  { value: CardPaymentStatus.unknown, label: "\ud655\uc778 \ud544\uc694" },
];

const CLAIM_FAX_HANDLING_TYPE_OPTIONS: {
  value: ClaimFaxHandlingType;
  label: string;
}[] = [
  { value: ClaimFaxHandlingType.fax, label: "\ud329\uc2a4 \uc0ac\uc6a9" },
  {
    value: ClaimFaxHandlingType.call_center_individual,
    label: "\ucf5c\uc13c\ud130 \uac1c\ubcc4\uc811\uc218",
  },
  { value: ClaimFaxHandlingType.unavailable, label: "\ud574\ub2f9\uc0ac\ud56d \uc5c6\uc74c" },
  { value: ClaimFaxHandlingType.unknown, label: "\ud655\uc778 \ud544\uc694" },
];

function formatDateInput(value: Date | null | undefined) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

function tristateDefault(value: boolean | null | undefined) {
  if (value === true) return "true";
  if (value === false) return "false";
  return "";
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className={sectionClass}>
      <header className="mb-4">
        <h2 className={sectionTitleClass}>{title}</h2>
        {description ? <p className={sectionDescClass}>{description}</p> : null}
      </header>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

interface InsurerFormProps {
  action: (formData: FormData) => void | Promise<void>;
  insurer?: Insurer | null;
  submitLabel: string;
}

export default function InsurerForm({
  action,
  insurer,
  submitLabel,
}: InsurerFormProps) {
  return (
    <form action={action} className="space-y-6">
      <div className="rounded-md border border-[#d9c9a8] bg-[#f7f1e5] p-4 text-sm leading-relaxed text-[#4f5661]">
        <p>{NOTICE_TEXT}</p>
        <p className="mt-2 text-xs text-[#5f6875]">{SENSITIVE_NOTICE_TEXT}</p>
      </div>

      <Section
        title="A. \uae30\ubcf8 \uc815\ubcf4"
        description="\ubcf4\ud5d8\uc0ac \uc774\ub984, \ubd84\ub958, \uacf5\uac1c \uc5ec\ubd80\uc640 \uac80\uc218 \uc0c1\ud0dc\ub97c \uad00\ub9ac\ud569\ub2c8\ub2e4."
      >
        <label className={labelClass}>
          \ubcf4\ud5d8\uc0ac \uc774\ub984
          <input
            className={fieldClass}
            name="name"
            required
            defaultValue={insurer?.name ?? ""}
          />
        </label>

        <label className={labelClass}>
          \ubd84\ub958
          <select
            className={fieldClass}
            name="category"
            required
            defaultValue={insurer?.category ?? InsurerCategory.life}
          >
            <option value={InsurerCategory.life}>\uc0dd\uba85\ubcf4\ud5d8</option>
            <option value={InsurerCategory.non_life}>\uc190\ud574\ubcf4\ud5d8</option>
          </select>
        </label>

        <label className={labelClass}>
          \uac80\uc218 \uc0c1\ud0dc
          <select
            className={fieldClass}
            name="verificationStatus"
            defaultValue={insurer?.verificationStatus ?? VerificationStatus.draft}
          >
            <option value={VerificationStatus.draft}>\ucd08\uc548 (Draft)</option>
            <option value={VerificationStatus.needs_review}>\uac80\uc218 \ud544\uc694 (Needs review)</option>
            <option value={VerificationStatus.verified}>\uac80\uc218 \uc644\ub8cc (Verified)</option>
          </select>
          <span className={hintClass}>
            \uacf5\uc2dd \ucd9c\ucc98\ub85c \uc0ac\ub78c\uc774 \uac80\uc218\ud55c \ub808\ucf54\ub4dc\ub9cc &quot;\uac80\uc218 \uc644\ub8cc&quot;\ub85c \ud45c\uc2dc\ud558\uc138\uc694. {ADMIN_VISIBILITY_COPY.governanceRule}
          </span>
        </label>

        <label className={labelClass}>
          \ucd5c\uc885 \uac80\uc218\uc77c
          <input
            className={fieldClass}
            name="lastVerifiedAt"
            type="date"
            defaultValue={formatDateInput(insurer?.lastVerifiedAt)}
          />
          <span className={hintClass}>
            \uc218\ub3d9 \uac80\uc218\uac00 \uc2e4\uc81c\ub85c \uc774\ub8e8\uc5b4\uc9c4 \ub0a0\uc9dc\ub9cc \uc785\ub825\ud558\uc138\uc694. \uac00\uc9dc \ub0a0\uc9dc \uc785\ub825 \uae08\uc9c0.
          </span>
        </label>

        <div className="md:col-span-2 space-y-3 rounded-md border border-[#c8d2dc] bg-[#eef3f7] p-4 text-sm leading-relaxed text-[#102235]">
          <p className="font-semibold">{ADMIN_VISIBILITY_COPY.policySummary}</p>
          <p className="text-[#4f5661]">{ADMIN_VISIBILITY_COPY.draftRule}</p>
          <label className="flex items-center gap-3 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-3 py-3 text-sm font-semibold text-[#102235]">
            <input
              name="isPublished"
              type="checkbox"
              defaultChecked={insurer?.isPublished ?? false}
              className="h-4 w-4 accent-[#1f6b55]"
            />
            \uacf5\uac1c (Published)
          </label>
          <p className="text-xs text-[#5f6875]">
            {ADMIN_VISIBILITY_COPY.draftPublishBlocked}
          </p>
        </div>
      </Section>

      <Section
        title="B. \uc811\uc18d (Access)"
        description="\uc124\uacc4\uc0ac\uc640 \uacf5\uac1c \uc0ac\uc6a9\uc790\uac00 \uc810\uadfc\ud558\ub294 \ub9c1\ud06c\ub97c \uad00\ub9ac\ud569\ub2c8\ub2e4."
      >
        <label className={labelClass}>
          \uacf5\uc2dd \uc6f9\uc0ac\uc774\ud2b8 URL
          <input
            className={fieldClass}
            name="officialWebsiteUrl"
            type="url"
            defaultValue={insurer?.officialWebsiteUrl ?? ""}
            placeholder={URL_PLACEHOLDER_OPTIONAL}
          />
        </label>

        <label className={labelClass}>
          \uc124\uacc4\uc0ac \ud3ec\ud138 URL
          <input
            className={fieldClass}
            name="plannerPortalUrl"
            type="url"
            defaultValue={insurer?.plannerPortalUrl ?? ""}
            placeholder={URL_PLACEHOLDER_OPTIONAL}
          />
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          \uc124\uacc4\uc0ac \uc804\uc0b0 \uc811\uc18d URL
          <input
            className={fieldClass}
            name="systemUrl"
            type="url"
            defaultValue={insurer?.systemUrl ?? ""}
            placeholder={URL_PLACEHOLDER_OPTIONAL}
          />
          <span className={hintClass}>
            \uc124\uacc4\uc0ac \uc804\uc6a9 \uc804\uc0b0 \ub85c\uadf8\uc778 \ud398\uc774\uc9c0\uc785\ub2c8\ub2e4. \uc77c\ubc18 \uace0\uac1d\uc6a9 \uc6f9\uc0ac\uc774\ud2b8\uc640 \uad6c\ubd84\ud574 \uc785\ub825\ud558\uc138\uc694.
          </span>
        </label>
      </Section>

      <Section
        title="C. \uc9c0\uc6d0 (Support)"
        description="\uace0\uac1d\uc13c\ud130\uc640 \uc124\uacc4\uc0ac \uc9c0\uc6d0 \uc804\ud654\ub97c \uad00\ub9ac\ud569\ub2c8\ub2e4."
      >
        <label className={labelClass}>
          \uace0\uac1d\uc13c\ud130 \ubc88\ud638
          <input
            className={fieldClass}
            name="customerCenterPhone"
            defaultValue={insurer?.customerCenterPhone ?? ""}
            placeholder="1588-0000"
          />
        </label>

        <label className={labelClass}>
          \uc804\uc0b0 \ud5ec\ud504\ub370\uc2a4\ud06c
          <input
            className={fieldClass}
            name="helpdeskPhone"
            defaultValue={insurer?.helpdeskPhone ?? ""}
            placeholder="1588-0000"
          />
          <span className={hintClass}>
            \uc124\uacc4\uc0ac \uc804\uc0b0 \uc811\uc18d \uc9c0\uc6d0\uc6a9 \ud68c\uc120\uc785\ub2c8\ub2e4. \uc77c\ubc18 \uace0\uac1d \ub300\uc751 \ubc88\ud638\uc640 \ubcc4\ub3c4\ub85c \uad00\ub9ac\ud558\uc138\uc694.
          </span>
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          \uc778\ucf5c \ubaa8\ub2c8\ud130\ub9c1 \ubc88\ud638
          <input
            className={fieldClass}
            name="callMonitoringPhone"
            defaultValue={insurer?.callMonitoringPhone ?? ""}
            placeholder="1588-0000"
          />
          <span className={hintClass}>
            \uc124\uacc4\uc0ac \uc77c\ucc98\ub9ac \ud488\uc9c8 \uc810\uac80\uc6a9 \ud68c\uc120\uc785\ub2c8\ub2e4. \uc77c\ubc18 \uace0\uac1d\uc5d0\uac8c \ub178\ucd9c\ud558\uc9c0 \ub9c8\uc138\uc694.
          </span>
        </label>
      </Section>

      <Section
        title="D. \uccad\uad6c (Claim)"
        description="\uccad\uad6c \uc811\uc218 \ub9c1\ud06c, \ud329\uc2a4, \uc8fc\uc18c, \uccad\uad6c \uc591\uc2dd\uc744 \uad00\ub9ac\ud569\ub2c8\ub2e4."
      >
        <label className={labelClass}>
          \uccad\uad6c \uc548\ub0b4 \ud398\uc774\uc9c0 URL
          <input
            className={fieldClass}
            name="claimPageUrl"
            type="url"
            defaultValue={insurer?.claimPageUrl ?? ""}
            placeholder={URL_PLACEHOLDER_OPTIONAL}
          />
        </label>

        <label className={labelClass}>
          \uccad\uad6c \uc591\uc2dd URL
          <input
            className={fieldClass}
            name="claimFormUrl"
            type="url"
            defaultValue={insurer?.claimFormUrl ?? ""}
            placeholder={URL_PLACEHOLDER_OPTIONAL}
          />
        </label>

        <label className={labelClass}>
          \uccad\uad6c \ud329\uc2a4 \ubc88\ud638
          <input
            className={fieldClass}
            name="claimFaxNumber"
            defaultValue={insurer?.claimFaxNumber ?? ""}
            placeholder="0505-000-0000"
          />
        </label>

        <label className={labelClass}>
          \uccad\uad6c \ud329\uc2a4 \ucc98\ub9ac \ubc29\uc2dd
          <select
            className={fieldClass}
            name="claimFaxHandlingType"
            defaultValue={insurer?.claimFaxHandlingType ?? ClaimFaxHandlingType.unknown}
          >
            {CLAIM_FAX_HANDLING_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className={hintClass}>
            \uccad\uad6c \uc811\uc218\ub97c \ucf5c\uc13c\ud130\uac00 \uac1c\ubcc4 \ucc98\ub9ac\ud558\ub294 \uacbd\uc6b0 &quot;\ucf5c\uc13c\ud130 \uac1c\ubcc4\uc811\uc218&quot;\ub97c \uc120\ud0dd\ud558\uc138\uc694.
          </span>
        </label>

        <label className={labelClass}>
          \uc77c\ubc18 \ud329\uc2a4 \ubc88\ud638
          <input
            className={fieldClass}
            name="faxNumber"
            defaultValue={insurer?.faxNumber ?? ""}
            placeholder="0505-000-0000"
          />
          <span className={hintClass}>\uccad\uad6c \uc6a9\ub3c4\uac00 \uc544\ub2cc \uc77c\ubc18 \ud589\uc815\uc6a9 \ud329\uc2a4 \ubc88\ud638\uc785\ub2c8\ub2e4.</span>
        </label>

        <label className={labelClass}>
          \uc77c\ubc18 \uc6b0\ud3b8 \uc8fc\uc18c
          <input
            className={fieldClass}
            name="mailingAddress"
            defaultValue={insurer?.mailingAddress ?? ""}
          />
          <span className={hintClass}>\uccad\uad6c \uc804\uc6a9\uc774 \uc544\ub2cc \uc77c\ubc18 \uc6b0\ud3b8 \uc8fc\uc18c\uc785\ub2c8\ub2e4.</span>
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          \uc8fc\uc18c (\uc6b0\ud3b8/\ub4f1\uae30)
          <input
            className={fieldClass}
            name="registeredMailAddress"
            defaultValue={insurer?.registeredMailAddress ?? ""}
          />
          <span className={hintClass}>
            \uccad\uad6c \ub4f1\uae30\uc6b0\ud3b8 \uc811\uc218 \uc8fc\uc18c\uc785\ub2c8\ub2e4. \uacf5\uc2dd \uc548\ub0b4\ubb38 \uae30\uc900\uc73c\ub85c \uc785\ub825\ud558\uc138\uc694.
          </span>
        </label>
      </Section>

      <Section
        title="E. \uc57d\uad00 / \uc548\ub0b4 (Policy / Disclosure)"
        description="\uc57d\uad00 \ubc0f \uacf5\uc2dd \uc548\ub0b4 \ub9c1\ud06c\ub97c \uad00\ub9ac\ud569\ub2c8\ub2e4."
      >
        <label className={`${labelClass} md:col-span-2`}>
          \uc57d\uad00 URL
          <input
            className={fieldClass}
            name="termsUrl"
            type="url"
            defaultValue={insurer?.termsUrl ?? ""}
            placeholder={URL_PLACEHOLDER_OPTIONAL}
          />
          <span className={hintClass}>
            \ubcf4\ud5d8\uc0ac \uacf5\uc2dd \uc57d\uad00 \ud398\uc774\uc9c0 \ub9c1\ud06c\ub9cc \ub4f1\ub85d\ud558\uc138\uc694.
          </span>
        </label>
      </Section>

      <Section
        title="F. \uce74\ub4dc\ub0a9 (Payment)"
        description="\uce74\ub4dc\ub0a9 \uac00\ub2a5 \uc5ec\ubd80\uc640 \uc870\uac74\uc744 \uad00\ub9ac\ud569\ub2c8\ub2e4. \ud655\uc778\ub418\uc9c0 \uc54a\uc740 \ud56d\ubaa9\uc740 &quot;\ud655\uc778 \ud544\uc694&quot;\ub85c \ub354 \ub354\ub985\ub2c8\ub2e4."
      >
        <label className={labelClass}>
          \ucd08\ud68c\ubcf4\ud5d8\ub8cc \uce74\ub4dc\ub0a9
          <select
            className={fieldClass}
            name="cardPaymentInitialAvailable"
            defaultValue={tristateDefault(insurer?.cardPaymentInitialAvailable)}
          >
            {TRISTATE_OPTIONS.map((option) => (
              <option key={option.value || "unknown"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          \uacc4\uc18d\ubcf4\ud5d8\ub8cc \uce74\ub4dc\ub0a9
          <select
            className={fieldClass}
            name="cardPaymentRecurringAvailable"
            defaultValue={tristateDefault(insurer?.cardPaymentRecurringAvailable)}
          >
            {TRISTATE_OPTIONS.map((option) => (
              <option key={option.value || "unknown"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          \uce74\ub4dc\ub0a9 \uc885\ud569 \uc0c1\ud0dc
          <select
            className={fieldClass}
            name="cardPaymentStatus"
            defaultValue={insurer?.cardPaymentStatus ?? CardPaymentStatus.unknown}
          >
            {CARD_PAYMENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className={hintClass}>
            \uc870\uac74\ubd80\ub85c \uc0ac\uc6a9 \uac00\ub2a5\ud55c \uacbd\uc6b0 \uc544\ub798 \ub9e4\ubaa8\uc5d0 \uc870\uac74\uc744 \uba85\uc2dc\ud574 \uc8fc\uc138\uc694.
          </span>
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          \uce74\ub4dc\ub0a9 \uc870\uac74 \uba54\ubaa8
          <textarea
            className={`${fieldClass} min-h-20`}
            name="cardPaymentNote"
            defaultValue={insurer?.cardPaymentNote ?? ""}
            placeholder="\uc608: \ud2b9\uc815 \uce74\ub4dc\ub9cc \uac00\ub2a5 / \uc628\ub77c\uc778 \uc561\uc218\uc6a9 \ud55c\uc815 \ub4f1"
          />
        </label>
      </Section>

      <Section
        title="G. \uc6b4\uc601 \uba54\ud0c0\ub370\uc774\ud130 (Governance)"
        description="\ucd9c\ucc98 \uba54\ubaa8, \ub0b4\ubd80 \ub178\ud2b8, \uc815\ub82c \uc21c\uc11c, \ud2b9\ubcc4 \ud45c\uae30 \uc5ec\ubd80\ub97c \uad00\ub9ac\ud569\ub2c8\ub2e4."
      >
        <label className={`${labelClass} md:col-span-2`}>
          \uacf5\uc2dd \ucd9c\ucc98 \uba54\ubaa8 (sourceNote)
          <textarea
            className={`${fieldClass} min-h-20`}
            name="sourceNote"
            defaultValue={insurer?.sourceNote ?? ""}
            placeholder="\uc608: 2026-05 \uacf5\uc2dd \uccad\uad6c \uc548\ub0b4\ubb38 PDF \uae30\uc900, content_admin \uac80\uc218"
          />
          <span className={hintClass}>
            \ub2f9 \ub808\ucf54\ub4dc\uc758 \uc6b4\uc601 \uc815\ubcf4\ub97c \ucc44\uc6b4 \ucd9c\ucc98\ub97c \uba85\ud655\ud788 \uae30\ub85d\ud558\uc138\uc694. \uc774 \uba54\ubaa8\ub294 \uacf5\uac1c \ud398\uc774\uc9c0\uc5d0 \ub178\ucd9c\ub418\uc9c0 \uc54a\uc544\ub3c4 \uc6b4\uc601\uc6a9\uc73c\ub85c \uc720\uc9c0\ub429\ub2c8\ub2e4.
          </span>
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          \ub0b4\ubd80 \ub178\ud2b8 (notes)
          <textarea
            className={`${fieldClass} min-h-20`}
            name="notes"
            defaultValue={insurer?.notes ?? ""}
          />
          <span className={hintClass}>
            \uace0\uac1d \uac1c\uc778\uc815\ubcf4, \uc758\ub8cc \ub370\uc774\ud130, \ubcf4\ud5d8\uae08 \ud310\ub2e8\uc740 \uc785\ub825\ud558\uc9c0 \ub9c8\uc138\uc694.
          </span>
        </label>

        <label className={labelClass}>
          \uc815\ub82c \uc21c\uc11c (sortOrder)
          <input
            className={fieldClass}
            name="sortOrder"
            type="number"
            inputMode="numeric"
            min={-10000}
            max={10000}
            step={1}
            defaultValue={insurer?.sortOrder ?? 0}
          />
          <span className={hintClass}>
            \uc228\uaca8\uc9c4 \uba54\ud0c0 \uac12\uc785\ub2c8\ub2e4. \uacf5\uac1c \ub514\ub809\ud1a0\ub9ac\uac00 \uc774 \uac12\uc744 \uc77d\ub294 \uc2dc\uc810\uc740 PR-31\uc5d0\uc11c \uacb0\uc815\ub429\ub2c8\ub2e4.
          </span>
        </label>

        <label className="flex items-center gap-3 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-3 py-3 text-sm font-semibold text-[#102235]">
          <input
            name="isFeatured"
            type="checkbox"
            defaultChecked={insurer?.isFeatured ?? false}
            className="h-4 w-4 accent-[#1f6b55]"
          />
          \ud2b9\ubcc4 \ud45c\uae30 (Featured)
        </label>
      </Section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/insurers"
          className="rounded-md border border-[#d9c9a8] px-4 py-2 text-center text-sm font-semibold text-[#4f5661] transition hover:bg-white"
        >
          \ucde8\uc18c
        </Link>
        <button
          type="submit"
          className="rounded-md bg-[#10243E] px-4 py-2 text-sm font-semibold text-[#F7F3E8] shadow-sm transition hover:bg-[#17324F] focus:outline-none focus:ring-2 focus:ring-[#B8924A] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
