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
  "공식 링크와 연락처는 공개 전 반드시 보험사 공식 출처 기준으로 검수해 주세요.";
const SENSITIVE_NOTICE_TEXT =
  "고객 개인정보, 의료 데이터, 보험금 지급 판단, 손해 사정 의견은 입력하지 마세요.";
const URL_PLACEHOLDER_OPTIONAL = "https://example.com";

const TRISTATE_OPTIONS = [
  { value: "", label: "확인 필요" },
  { value: "true", label: "가능" },
  { value: "false", label: "해당사항 없음" },
];

const CARD_PAYMENT_STATUS_OPTIONS: { value: CardPaymentStatus; label: string }[] = [
  { value: CardPaymentStatus.available, label: "사용 가능" },
  { value: CardPaymentStatus.conditional, label: "조건부 사용" },
  { value: CardPaymentStatus.unavailable, label: "해당사항 없음" },
  { value: CardPaymentStatus.unknown, label: "확인 필요" },
];

const CLAIM_FAX_HANDLING_TYPE_OPTIONS: {
  value: ClaimFaxHandlingType;
  label: string;
}[] = [
  { value: ClaimFaxHandlingType.fax, label: "팩스 사용" },
  {
    value: ClaimFaxHandlingType.call_center_individual,
    label: "콜센터 개별접수",
  },
  { value: ClaimFaxHandlingType.unavailable, label: "해당사항 없음" },
  { value: ClaimFaxHandlingType.unknown, label: "확인 필요" },
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
        title="A. 기본 정보"
        description="보험사 이름, 분류, 공개 여부와 검수 상태를 관리합니다."
      >
        <label className={labelClass}>
          보험사 이름
          <input
            className={fieldClass}
            name="name"
            required
            defaultValue={insurer?.name ?? ""}
          />
        </label>

        <label className={labelClass}>
          분류
          <select
            className={fieldClass}
            name="category"
            required
            defaultValue={insurer?.category ?? InsurerCategory.life}
          >
            <option value={InsurerCategory.life}>생명보험</option>
            <option value={InsurerCategory.non_life}>손해보험</option>
          </select>
        </label>

        <label className={labelClass}>
          검수 상태
          <select
            className={fieldClass}
            name="verificationStatus"
            defaultValue={insurer?.verificationStatus ?? VerificationStatus.draft}
          >
            <option value={VerificationStatus.draft}>초안 (Draft)</option>
            <option value={VerificationStatus.needs_review}>검수 필요 (Needs review)</option>
            <option value={VerificationStatus.verified}>검수 완료 (Verified)</option>
          </select>
          <span className={hintClass}>
            {"공식 출처로 사람이 검수한 레코드만 '검수 완료'로 표시하세요. "}
            {ADMIN_VISIBILITY_COPY.governanceRule}
          </span>
        </label>

        <label className={labelClass}>
          최종 검수일
          <input
            className={fieldClass}
            name="lastVerifiedAt"
            type="date"
            defaultValue={formatDateInput(insurer?.lastVerifiedAt)}
          />
          <span className={hintClass}>
            수동 검수가 실제로 이루어진 날짜만 입력하세요. 가짜 날짜 입력 금지.
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
            공개 (Published)
          </label>
          <p className="text-xs text-[#5f6875]">
            {ADMIN_VISIBILITY_COPY.draftPublishBlocked}
          </p>
        </div>
      </Section>

      <Section
        title="B. 접속 (Access)"
        description="설계사와 공개 사용자가 접근하는 링크를 관리합니다."
      >
        <label className={labelClass}>
          공식 웹사이트 URL
          <input
            className={fieldClass}
            name="officialWebsiteUrl"
            type="url"
            defaultValue={insurer?.officialWebsiteUrl ?? ""}
            placeholder={URL_PLACEHOLDER_OPTIONAL}
          />
        </label>

        <label className={labelClass}>
          설계사 포털 URL
          <input
            className={fieldClass}
            name="plannerPortalUrl"
            type="url"
            defaultValue={insurer?.plannerPortalUrl ?? ""}
            placeholder={URL_PLACEHOLDER_OPTIONAL}
          />
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          설계사 전산 접속 URL
          <input
            className={fieldClass}
            name="systemUrl"
            type="url"
            defaultValue={insurer?.systemUrl ?? ""}
            placeholder={URL_PLACEHOLDER_OPTIONAL}
          />
          <span className={hintClass}>
            설계사 전용 전산 로그인 페이지입니다. 일반 고객용 웹사이트와 구분해 입력하세요.
          </span>
        </label>
      </Section>

      <Section
        title="C. 지원 (Support)"
        description="고객센터와 설계사 지원 전화를 관리합니다."
      >
        <label className={labelClass}>
          고객센터 번호
          <input
            className={fieldClass}
            name="customerCenterPhone"
            defaultValue={insurer?.customerCenterPhone ?? ""}
            placeholder="1588-0000"
          />
        </label>

        <label className={labelClass}>
          전산 헬프데스크
          <input
            className={fieldClass}
            name="helpdeskPhone"
            defaultValue={insurer?.helpdeskPhone ?? ""}
            placeholder="1588-0000"
          />
          <span className={hintClass}>
            설계사 전산 접속 지원용 회선입니다. 일반 고객 대응 번호와 별도로 관리하세요.
          </span>
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          인콜 모니터링 번호
          <input
            className={fieldClass}
            name="callMonitoringPhone"
            defaultValue={insurer?.callMonitoringPhone ?? ""}
            placeholder="1588-0000"
          />
          <span className={hintClass}>
            설계사 일처리 품질 점검용 회선입니다. 일반 고객에게 노출하지 마세요.
          </span>
        </label>
      </Section>

      <Section
        title="D. 청구 (Claim)"
        description="청구 접수 링크, 팩스, 주소, 청구 양식을 관리합니다."
      >
        <label className={labelClass}>
          청구 안내 페이지 URL
          <input
            className={fieldClass}
            name="claimPageUrl"
            type="url"
            defaultValue={insurer?.claimPageUrl ?? ""}
            placeholder={URL_PLACEHOLDER_OPTIONAL}
          />
        </label>

        <label className={labelClass}>
          청구 양식 URL
          <input
            className={fieldClass}
            name="claimFormUrl"
            type="url"
            defaultValue={insurer?.claimFormUrl ?? ""}
            placeholder={URL_PLACEHOLDER_OPTIONAL}
          />
        </label>

        <label className={labelClass}>
          청구 팩스 번호
          <input
            className={fieldClass}
            name="claimFaxNumber"
            defaultValue={insurer?.claimFaxNumber ?? ""}
            placeholder="0505-000-0000"
          />
        </label>

        <label className={labelClass}>
          청구 팩스 처리 방식
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
            {"청구 접수를 콜센터가 개별 처리하는 경우 '콜센터 개별접수'를 선택하세요."}
          </span>
        </label>

        <label className={labelClass}>
          일반 팩스 번호
          <input
            className={fieldClass}
            name="faxNumber"
            defaultValue={insurer?.faxNumber ?? ""}
            placeholder="0505-000-0000"
          />
          <span className={hintClass}>청구 용도가 아닌 일반 행정용 팩스 번호입니다.</span>
        </label>

        <label className={labelClass}>
          일반 우편 주소
          <input
            className={fieldClass}
            name="mailingAddress"
            defaultValue={insurer?.mailingAddress ?? ""}
          />
          <span className={hintClass}>청구 전용이 아닌 일반 우편 주소입니다.</span>
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          주소 (우편/등기)
          <input
            className={fieldClass}
            name="registeredMailAddress"
            defaultValue={insurer?.registeredMailAddress ?? ""}
          />
          <span className={hintClass}>
            청구 등기우편 접수 주소입니다. 공식 안내문 기준으로 입력하세요.
          </span>
        </label>
      </Section>

      <Section
        title="E. 약관 / 안내 (Policy / Disclosure)"
        description="약관 및 공식 안내 링크를 관리합니다."
      >
        <label className={`${labelClass} md:col-span-2`}>
          약관 URL
          <input
            className={fieldClass}
            name="termsUrl"
            type="url"
            defaultValue={insurer?.termsUrl ?? ""}
            placeholder={URL_PLACEHOLDER_OPTIONAL}
          />
          <span className={hintClass}>
            보험사 공식 약관 페이지 링크만 등록하세요.
          </span>
        </label>
      </Section>

      <Section
        title="F. 카드납 (Payment)"
        description="카드납 가능 여부와 조건을 관리합니다. 확인되지 않은 항목은 '확인 필요'로 둡니다."
      >
        <label className={labelClass}>
          초회보험료 카드납
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
          계속보험료 카드납
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
          카드납 종합 상태
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
            조건부로 사용 가능한 경우 아래 메모에 조건을 명시해 주세요.
          </span>
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          카드납 조건 메모
          <textarea
            className={`${fieldClass} min-h-20`}
            name="cardPaymentNote"
            defaultValue={insurer?.cardPaymentNote ?? ""}
            placeholder="예: 특정 카드만 가능 / 온라인 액수용 한정 등"
          />
        </label>
      </Section>

      <Section
        title="G. 운영 메타데이터 (Governance)"
        description="출처 메모, 내부 노트, 정렬 순서, 특별 표기 여부를 관리합니다."
      >
        <label className={`${labelClass} md:col-span-2`}>
          공식 출처 메모 (sourceNote)
          <textarea
            className={`${fieldClass} min-h-20`}
            name="sourceNote"
            defaultValue={insurer?.sourceNote ?? ""}
            placeholder="예: 2026-05 공식 청구 안내문 PDF 기준, content_admin 검수"
          />
          <span className={hintClass}>
            당 레코드의 운영 정보를 채운 출처를 명확히 기록하세요. 이 메모는 공개 페이지에 노출되지 않아도 운영용으로 유지됩니다.
          </span>
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          내부 노트 (notes)
          <textarea
            className={`${fieldClass} min-h-20`}
            name="notes"
            defaultValue={insurer?.notes ?? ""}
          />
          <span className={hintClass}>
            고객 개인정보, 의료 데이터, 보험금 판단은 입력하지 마세요.
          </span>
        </label>

        <label className={labelClass}>
          정렬 순서 (sortOrder)
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
            숨겨진 메타 값입니다. 공개 디렉토리가 이 값을 읽는 시점은 PR-31에서 결정됩니다.
          </span>
        </label>

        <label className="flex items-center gap-3 rounded-md border border-[#d9c9a8] bg-[#f7f1e5] px-3 py-3 text-sm font-semibold text-[#102235]">
          <input
            name="isFeatured"
            type="checkbox"
            defaultChecked={insurer?.isFeatured ?? false}
            className="h-4 w-4 accent-[#1f6b55]"
          />
          특별 표기 (Featured)
        </label>
      </Section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/insurers"
          className="rounded-md border border-[#d9c9a8] px-4 py-2 text-center text-sm font-semibold text-[#4f5661] transition hover:bg-white"
        >
          취소
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
