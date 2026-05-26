import Link from "next/link";
import type { ReactNode } from "react";
import {
  ClaimDocumentCategory,
  VerificationStatus,
  type ClaimDocument,
} from "@prisma/client";
import { PROHIBITED_PHRASES } from "@/lib/validators/claim-document";
import {
  ADMIN_CLAIM_DOC_COPY,
  CLAIM_DOCUMENT_CATEGORY_OPTIONS,
} from "./visibility";

const fieldClass =
  "mt-1 w-full rounded-md border border-[#d9c9a8] bg-white px-3 py-2 text-sm text-[#102235] outline-none transition focus:border-[#1f6b55] focus:ring-2 focus:ring-[#1f6b55]/15";
const labelClass = "block text-sm font-semibold text-[#102235]";
const hintClass = "mt-1 text-xs leading-relaxed text-[#5f6875]";
const sectionClass =
  "rounded-lg border border-[#e7ddc9] bg-white p-5 shadow-sm sm:p-6";
const sectionTitleClass = "text-base font-semibold text-[#102235]";
const sectionDescClass = "mt-1 text-xs leading-relaxed text-[#5f6875]";

const URL_PLACEHOLDER_OPTIONAL = "https://example.com";

export interface InsurerOption {
  id: string;
  name: string;
}

interface ClaimDocumentFormProps {
  action: (formData: FormData) => void | Promise<void>;
  claimDocument?: ClaimDocument | null;
  insurers: InsurerOption[];
  submitLabel: string;
}

function formatDateInput(value: Date | null | undefined) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
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

export default function ClaimDocumentForm({
  action,
  claimDocument,
  insurers,
  submitLabel,
}: ClaimDocumentFormProps) {
  return (
    <form action={action} className="space-y-6">
      <div className="rounded-md border border-[#d6a36e] bg-[#fff5e1] p-4 text-sm leading-relaxed text-[#7b4b19]">
        <p className="font-semibold">{ADMIN_CLAIM_DOC_COPY.guidanceNotice}</p>
        <p className="mt-2 text-[#4f5661]">
          {ADMIN_CLAIM_DOC_COPY.sensitiveNotice}
        </p>
      </div>

      <Section
        title={"A. \uae30\ubcf8 \uc815\ubcf4"}
        description={
          "\uc81c\ubaa9, \uc2ac\ub7ec\uadf8, \uccad\uad6c \uc720\ud615, \uac80\uc218 \uc0c1\ud0dc, \ucd5c\uc885 \uac80\uc218\uc77c\uc744 \uad00\ub9ac\ud569\ub2c8\ub2e4."
        }
      >
        <label className={`${labelClass} md:col-span-2`}>
          {"\uc81c\ubaa9"}
          <input
            className={fieldClass}
            name="title"
            required
            maxLength={200}
            defaultValue={claimDocument?.title ?? ""}
            placeholder={
              "\uc608: \uc2e4\uc190 \uc678\ub798 \uc9c4\ub8cc \uccad\uad6c \uc548\ub0b4"
            }
          />
          <span className={hintClass}>
            {
              "\uacf5\uac1c \uc0ac\uc6a9\uc790\uc640 \uc124\uacc4\uc0ac\uac00 \ud55c\ub208\uc5d0 \uc774\ud574\ud560 \uc218 \uc788\ub294 Korean \uc81c\ubaa9\uc785\ub2c8\ub2e4. \uacb0\ub860 \uc5b8\uae09\uc774\ub098 \uc9c0\uae09 \ubcf4\uc7a5 \ud45c\ud604\uc740 \uc0ac\uc6a9\ud558\uc9c0 \ub9c8\uc138\uc694."
            }
          </span>
        </label>

        <label className={labelClass}>
          {"\uc2ac\ub7ec\uadf8 (URL \uacbd\ub85c)"}
          <input
            className={fieldClass}
            name="slug"
            required
            maxLength={80}
            defaultValue={claimDocument?.slug ?? ""}
            placeholder="actual-expense-outpatient"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          />
          <span className={hintClass}>
            {
              "\uc18c\ubb38\uc790, \uc22b\uc790, \ud558\uc774\ud508(-) \ub9cc \uc0ac\uc6a9 \uac00\ub2a5\ud569\ub2c8\ub2e4. \ucd94\ud6c4 \uacf5\uac1c URL\uc758 \uacbd\ub85c\ub85c \uc0ac\uc6a9\ub429\ub2c8\ub2e4."
            }
          </span>
        </label>

        <label className={labelClass}>
          {"\uccad\uad6c \uc720\ud615"}
          <select
            className={fieldClass}
            name="category"
            required
            defaultValue={
              claimDocument?.category ?? ClaimDocumentCategory.actual_expense
            }
          >
            {CLAIM_DOCUMENT_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          {"\uac80\uc218 \uc0c1\ud0dc"}
          <select
            className={fieldClass}
            name="verificationStatus"
            defaultValue={
              claimDocument?.verificationStatus ?? VerificationStatus.draft
            }
          >
            <option value={VerificationStatus.draft}>
              {"\ucd08\uc548 (Draft)"}
            </option>
            <option value={VerificationStatus.needs_review}>
              {"\uac80\uc218 \ud544\uc694 (Needs review)"}
            </option>
            <option value={VerificationStatus.verified}>
              {"\uac80\uc218 \uc644\ub8cc (Verified)"}
            </option>
          </select>
          <span className={hintClass}>
            {
              "\uacf5\uc2dd \ucd9c\ucc98\ub85c \uac80\uc218\ub41c \ub808\ucf54\ub4dc\ub9cc \"\uac80\uc218 \uc644\ub8cc\"\ub85c \ud45c\uc2dc\ud558\uc138\uc694. "
            }
            {ADMIN_CLAIM_DOC_COPY.governanceRule}
          </span>
        </label>

        <label className={labelClass}>
          {"\ucd5c\uc885 \uac80\uc218\uc77c"}
          <input
            className={fieldClass}
            name="lastVerifiedAt"
            type="date"
            defaultValue={formatDateInput(claimDocument?.lastVerifiedAt)}
          />
          <span className={hintClass}>
            {
              "\uc218\ub3d9 \uac80\uc218\uac00 \uc2e4\uc81c\ub85c \uc774\ub8e8\uc5b4\uc9c4 \ub0a0\uc9dc\ub9cc \uc785\ub825\ud558\uc138\uc694. \uac00\uc9dc \ub0a0\uc9dc \uc785\ub825 \uae08\uc9c0."
            }
          </span>
        </label>
      </Section>

      <Section
        title={"B. \ubcf4\ud5d8\uc0ac \uc5f0\uacb0"}
        description={
          "\ud2b9\uc815 \ubcf4\ud5d8\uc0ac\uc758 \uccad\uad6c \uc548\ub0b4\uc77c \ub54c\ub9cc \uc120\ud0dd\ud558\uc138\uc694. \uacf5\uac1c\ub3c4 \ub300\uc0c1\uc774 \uc5c6\ub294 \uc77c\ubc18 \uccad\uad6c \uc548\ub0b4\ub294 \uc5f0\uacb0\ud558\uc9c0 \uc54a\uace0 \ub458 \uc218 \uc788\uc2b5\ub2c8\ub2e4."
        }
      >
        <label className={`${labelClass} md:col-span-2`}>
          {"\ubcf4\ud5d8\uc0ac"}
          <select
            className={fieldClass}
            name="insurerId"
            defaultValue={claimDocument?.insurerId ?? "none"}
          >
            <option value="none">
              {"\uc5f0\uacb0 \uc5c6\uc74c (\uc77c\ubc18 \uccad\uad6c \uc548\ub0b4)"}
            </option>
            {insurers.map((insurer) => (
              <option key={insurer.id} value={insurer.id}>
                {insurer.name}
              </option>
            ))}
          </select>
          <span className={hintClass}>
            {
              "\ubcf4\ud5d8\uc0ac \uc0ad\uc81c \uc2dc \uc774 \ud544\ub4dc\ub294 \uc790\ub3d9\uc73c\ub85c \ube44\uc6c4\uc73c\ub85c \uc124\uc815\ub429\ub2c8\ub2e4 (ON DELETE SET NULL)."
            }
          </span>
        </label>
      </Section>

      <Section
        title={"C. \uc548\ub0b4 \ubcf8\ubb38"}
        description={
          "\uacf5\uac1c \uace0\uac1d\uacfc \uc124\uacc4\uc0ac\uac00 \uc77d\ub294 \uc81c\ubaa9 \uc678 \ubcf8\ubb38\uc785\ub2c8\ub2e4. \uacf5\uc2dd \uc57d\uad00\uacfc \uc8fc\uc758 \uc0ac\ud56d\uc744 \ub354\ud574 \uc8fc\uc138\uc694."
        }
      >
        <label className={`${labelClass} md:col-span-2`}>
          {"\uac1c\uc694 \uc694\uc57d (summary)"}
          <textarea
            className={`${fieldClass} min-h-20`}
            name="summary"
            maxLength={1000}
            defaultValue={claimDocument?.summary ?? ""}
            placeholder={
              "\uc608: \uc678\ub798 \uc9c4\ub8cc\ube44\uc758 \uc77c\ubc18\uc801\uc778 \uccad\uad6c \uc808\ucc28\ub97c \uc548\ub0b4\ud558\ub294 \uc790\ub8cc\uc785\ub2c8\ub2e4."
            }
          />
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          {"\ud544\uc218 \uc11c\ub958 (requiredDocuments)"}
          <textarea
            className={`${fieldClass} min-h-28`}
            name="requiredDocuments"
            maxLength={4000}
            defaultValue={claimDocument?.requiredDocuments ?? ""}
            placeholder={
              "\uac01 \uc904\uc5d0 \ud558\ub098\uc529 \uc801\uc5b4\uc8fc\uc138\uc694. \ud544\uc694\uc11c\ub958\ub294 \ubcf4\ud5d8\uc0ac \ubc0f \uc57d\uad00\uc5d0 \ub530\ub77c \ub2ec\ub77c\uc9c8 \uc218 \uc788\uc2b5\ub2c8\ub2e4."
            }
          />
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          {"\uc120\ud0dd \uc11c\ub958 (optionalDocuments)"}
          <textarea
            className={`${fieldClass} min-h-20`}
            name="optionalDocuments"
            maxLength={4000}
            defaultValue={claimDocument?.optionalDocuments ?? ""}
          />
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          {"\uc8fc\uc758 \uc0ac\ud56d (cautionNote)"}
          <textarea
            className={`${fieldClass} min-h-20`}
            name="cautionNote"
            maxLength={1000}
            defaultValue={claimDocument?.cautionNote ?? ""}
            placeholder={
              "\uc608: \ud544\uc694\uc11c\ub958\ub294 \ubcf4\ud5d8\uc0ac \ubc0f \uc57d\uad00\uc5d0 \ub530\ub77c \ub2ec\ub77c\uc9c8 \uc218 \uc788\uc2b5\ub2c8\ub2e4."
            }
          />
          <span className={hintClass}>
            {
              "\uc774 \uc548\ub0b4\ub294 \uc77c\ubc18 \uc808\ucc28\ub97c \uc815\ub9ac\ud55c \uac83\uc73c\ub85c, \uac1c\ubcc4 \uccad\uad6c \uacb0\uacfc\ub97c \ubcf4\uc7a5\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4."
            }
          </span>
        </label>
      </Section>

      <Section
        title={"D. \uacf5\uc2dd \ub9c1\ud06c"}
        description={
          "\uccad\uad6c\uc591\uc2dd \ub9c1\ud06c\uc640 \uacf5\uc2dd \ucd9c\ucc98 \ub9c1\ud06c\ub294 \uacf5\uac1c \uc804 \ubc18\ub4dc\uc2dc \uac80\uc218\ub418\uc5c8\ub294\uc9c0 \ud655\uc778\ud574 \uc8fc\uc138\uc694."
        }
      >
        <label className={labelClass}>
          {"\uccad\uad6c\uc591\uc2dd URL (claimFormUrl)"}
          <input
            className={fieldClass}
            name="claimFormUrl"
            type="url"
            defaultValue={claimDocument?.claimFormUrl ?? ""}
            placeholder={URL_PLACEHOLDER_OPTIONAL}
          />
        </label>

        <label className={labelClass}>
          {"\uacf5\uc2dd \ucd9c\ucc98 URL (officialSourceUrl)"}
          <input
            className={fieldClass}
            name="officialSourceUrl"
            type="url"
            defaultValue={claimDocument?.officialSourceUrl ?? ""}
            placeholder={URL_PLACEHOLDER_OPTIONAL}
          />
          <span className={hintClass}>
            {
              "\uc774 \ub808\ucf54\ub4dc\ub97c \uac80\uc218\ud55c \ubcf4\ud5d8\uc0ac \uacf5\uc2dd \uc548\ub0b4\u00b7\uc57d\uad00\u00b7\uacf5\uc2dc \ud398\uc774\uc9c0 \ub9c1\ud06c\ub97c \uc785\ub825\ud558\uc138\uc694."
            }
          </span>
        </label>
      </Section>

      <Section
        title={"E. \uace0\uac1d\uc6a9 \uc548\ub0b4 \ud15c\ud50c\ub9bf"}
        description={
          "\uc124\uacc4\uc0ac\uac00 \uace0\uac1d\uc5d0\uac8c \ubcf4\ub0bc \uc218 \uc788\ub294 \uc774\ub984\u00b7\uba54\uc2dc\uc9c0 \ud14d\uc2a4\ud2b8\uc785\ub2c8\ub2e4. \uc758\ub8cc \ud574\uc11d\uc774\ub098 \uc9c0\uae09 \uc57d\uc18d \ud45c\ud604\uc740 \uc0ac\uc6a9\ud558\uc9c0 \ub9c8\uc138\uc694."
        }
      >
        <label className={`${labelClass} md:col-span-2`}>
          {"\uace0\uac1d\uc6a9 \uba54\uc2dc\uc9c0 \ud15c\ud50c\ub9bf (customerMessageTemplate)"}
          <textarea
            className={`${fieldClass} min-h-24`}
            name="customerMessageTemplate"
            maxLength={2000}
            defaultValue={claimDocument?.customerMessageTemplate ?? ""}
            placeholder={
              "\uc608: \uc548\ub155\ud558\uc138\uc694, OO\ub2d8. \uc678\ub798 \uc9c4\ub8cc \uccad\uad6c \uc548\ub0b4\ub4dc\ub9bd\ub2c8\ub2e4..."
            }
          />
        </label>
      </Section>

      <Section
        title={"F. \uc6b4\uc601 \uba54\ud0c0\ub370\uc774\ud130 (Governance)"}
        description={
          "\uc815\ub82c \uc21c\uc11c\uc640 \uacf5\uac1c \uc5ec\ubd80\ub294 \uc774\uacf3\uc5d0\uc11c \uad00\ub9ac\ud569\ub2c8\ub2e4. \ud558\ub4dc \uc0ad\uc81c\ub294 \uc81c\uacf5\ub418\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4."
        }
      >
        <label className={labelClass}>
          {"\uc815\ub82c \uc21c\uc11c (sortOrder)"}
          <input
            className={fieldClass}
            name="sortOrder"
            type="number"
            inputMode="numeric"
            min={-10000}
            max={10000}
            step={1}
            defaultValue={claimDocument?.sortOrder ?? 0}
          />
          <span className={hintClass}>
            {
              "\uacf5\uac1c \ud654\uba74\uc5d0\uc11c \ub54c\uadf8\ub4e4 \uba74 \ub17c\ub9ac\uc801 \uc21c\uc11c\ub97c \uc870\uc815\ud569\ub2c8\ub2e4. PR-39 \uacf5\uac1c \uc77d\uae30\uc5d0\uc11c \uc774 \uac12\uc744 \ucc38\uc870\ud569\ub2c8\ub2e4."
            }
          </span>
        </label>

        <div className="md:col-span-2 space-y-3 rounded-md border border-[#c8d2dc] bg-[#eef3f7] p-4 text-sm leading-relaxed text-[#102235]">
          <p className="font-semibold">{ADMIN_CLAIM_DOC_COPY.policySummary}</p>
          <p className="text-[#4f5661]">{ADMIN_CLAIM_DOC_COPY.draftRule}</p>
          <label className="flex items-center gap-3 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-3 py-3 text-sm font-semibold text-[#102235]">
            <input
              name="isPublished"
              type="checkbox"
              defaultChecked={claimDocument?.isPublished ?? false}
              className="h-4 w-4 accent-[#1f6b55]"
            />
            {"\uacf5\uac1c (Published)"}
          </label>
          <p className="text-xs text-[#5f6875]">
            {ADMIN_CLAIM_DOC_COPY.draftPublishBlocked}
          </p>
        </div>
      </Section>

      <section className="rounded-md border border-[#d9c9a8] bg-[#f7f1e5] p-4 text-xs leading-relaxed text-[#4f5661]">
        <p className="font-semibold text-[#102235]">
          {
            "\uc0ac\uc6a9\uc774 \uae08\uc9c0\ub41c \ud45c\ud604 (\uc11c\ubc84 \uc800\uc7a5 \uc804 \uc790\ub3d9 \uac80\uc0ac\ub429\ub2c8\ub2e4)"
          }
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {PROHIBITED_PHRASES.map((phrase) => (
            <li key={phrase}>{phrase}</li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/claim-documents"
          className="rounded-md border border-[#d9c9a8] px-4 py-2 text-center text-sm font-semibold text-[#4f5661] transition hover:bg-white"
        >
          {"\ucde8\uc18c"}
        </Link>
        <button
          type="submit"
          className="rounded-md bg-[#102235] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1b344e]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
