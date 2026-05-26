import Link from "next/link";
import {
  InsurerCategory,
  VerificationStatus,
  type Insurer,
} from "@prisma/client";

const fieldClass =
  "mt-1 w-full rounded-md border border-[#d9c9a8] bg-white px-3 py-2 text-sm text-[#102235] outline-none transition focus:border-[#1f6b55] focus:ring-2 focus:ring-[#1f6b55]/15";
const labelClass = "block text-sm font-semibold text-[#102235]";
const hintClass = "mt-1 text-xs leading-relaxed text-[#5f6875]";

function formatDateInput(value: Date | null | undefined) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
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
      <div className="grid gap-5 md:grid-cols-2">
        <label className={labelClass}>
          Name
          <input
            className={fieldClass}
            name="name"
            required
            defaultValue={insurer?.name ?? ""}
          />
        </label>

        <label className={labelClass}>
          Category
          <select
            className={fieldClass}
            name="category"
            required
            defaultValue={insurer?.category ?? InsurerCategory.life}
          >
            <option value={InsurerCategory.life}>Life insurance</option>
            <option value={InsurerCategory.non_life}>Non-life insurance</option>
          </select>
        </label>

        <label className={labelClass}>
          Official website URL
          <input
            className={fieldClass}
            name="officialWebsiteUrl"
            type="url"
            defaultValue={insurer?.officialWebsiteUrl ?? ""}
            placeholder="https://example.com"
          />
        </label>

        <label className={labelClass}>
          Planner portal URL
          <input
            className={fieldClass}
            name="plannerPortalUrl"
            type="url"
            defaultValue={insurer?.plannerPortalUrl ?? ""}
            placeholder="https://example.com"
          />
        </label>

        <label className={labelClass}>
          Claim page URL
          <input
            className={fieldClass}
            name="claimPageUrl"
            type="url"
            defaultValue={insurer?.claimPageUrl ?? ""}
            placeholder="https://example.com"
          />
        </label>

        <label className={labelClass}>
          Customer center phone
          <input
            className={fieldClass}
            name="customerCenterPhone"
            defaultValue={insurer?.customerCenterPhone ?? ""}
          />
        </label>

        <label className={labelClass}>
          Fax number
          <input
            className={fieldClass}
            name="faxNumber"
            defaultValue={insurer?.faxNumber ?? ""}
          />
        </label>

        <label className={labelClass}>
          Last verified date
          <input
            className={fieldClass}
            name="lastVerifiedAt"
            type="date"
            defaultValue={formatDateInput(insurer?.lastVerifiedAt)}
          />
          <span className={hintClass}>Leave empty unless manual verification happened.</span>
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          Mailing address
          <input
            className={fieldClass}
            name="mailingAddress"
            defaultValue={insurer?.mailingAddress ?? ""}
          />
        </label>

        <label className={labelClass}>
          Verification status
          <select
            className={fieldClass}
            name="verificationStatus"
            defaultValue={insurer?.verificationStatus ?? VerificationStatus.draft}
          >
            <option value={VerificationStatus.draft}>Draft</option>
            <option value={VerificationStatus.needs_review}>Needs review</option>
            <option value={VerificationStatus.verified}>Verified</option>
          </select>
        </label>

        <label className="flex items-center gap-3 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-3 py-3 text-sm font-semibold text-[#102235]">
          <input
            name="isPublished"
            type="checkbox"
            defaultChecked={insurer?.isPublished ?? false}
            className="h-4 w-4 accent-[#1f6b55]"
          />
          Published
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          Notes
          <textarea
            className={`${fieldClass} min-h-28`}
            name="notes"
            defaultValue={insurer?.notes ?? ""}
          />
        </label>
      </div>

      <div className="rounded-md border border-[#d9c9a8] bg-[#f7f1e5] p-4 text-sm leading-relaxed text-[#4f5661]">
        Official URLs and contact details must be verified before publication.
        Do not enter customer data, medical data, claim payout judgments, or
        loss-adjusting advice.
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/insurers"
          className="rounded-md border border-[#d9c9a8] px-4 py-2 text-center text-sm font-semibold text-[#4f5661] transition hover:bg-white"
        >
          Cancel
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
