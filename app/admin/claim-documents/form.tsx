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
        title="A. 기본 정보"
        description="제목, 슬러그, 청구 유형, 검수 상태, 최종 검수일을 관리합니다."
      >
        <label className={`${labelClass} md:col-span-2`}>
          제목
          <input
            className={fieldClass}
            name="title"
            required
            maxLength={200}
            defaultValue={claimDocument?.title ?? ""}
            placeholder="예: 실손 외래 진료 청구 안내"
          />
          <span className={hintClass}>
            공개 사용자와 설계사가 한눈에 이해할 수 있는 Korean 제목입니다. 결론 언급이나 지급 보장 표현은 사용하지 마세요.
          </span>
        </label>

        <label className={labelClass}>
          슬러그 (URL 경로)
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
            소문자, 숫자, 하이픈(-) 만 사용 가능합니다. 추후 공개 URL의 경로로 사용됩니다.
          </span>
        </label>

        <label className={labelClass}>
          청구 유형
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
          검수 상태
          <select
            className={fieldClass}
            name="verificationStatus"
            defaultValue={
              claimDocument?.verificationStatus ?? VerificationStatus.draft
            }
          >
            <option value={VerificationStatus.draft}>
              초안 (Draft)
            </option>
            <option value={VerificationStatus.needs_review}>
              검수 필요 (Needs review)
            </option>
            <option value={VerificationStatus.verified}>
              검수 완료 (Verified)
            </option>
          </select>
          <span className={hintClass}>
            {"공식 출처로 검수된 레코드만 '검수 완료'로 표시하세요. "}
            {ADMIN_CLAIM_DOC_COPY.governanceRule}
          </span>
        </label>

        <label className={labelClass}>
          최종 검수일
          <input
            className={fieldClass}
            name="lastVerifiedAt"
            type="date"
            defaultValue={formatDateInput(claimDocument?.lastVerifiedAt)}
          />
          <span className={hintClass}>
            수동 검수가 실제로 이루어진 날짜만 입력하세요. 가짜 날짜 입력 금지.
          </span>
        </label>
      </Section>

      <Section
        title="B. 보험사 연결"
        description="특정 보험사의 청구 안내일 때만 선택하세요. 공개도 대상이 없는 일반 청구 안내는 연결하지 않고 둘 수 있습니다."
      >
        <label className={`${labelClass} md:col-span-2`}>
          보험사
          <select
            className={fieldClass}
            name="insurerId"
            defaultValue={claimDocument?.insurerId ?? "none"}
          >
            <option value="none">
              연결 없음 (일반 청구 안내)
            </option>
            {insurers.map((insurer) => (
              <option key={insurer.id} value={insurer.id}>
                {insurer.name}
              </option>
            ))}
          </select>
          <span className={hintClass}>
            보험사 삭제 시 이 필드는 자동으로 비움으로 설정됩니다 (ON DELETE SET NULL).
          </span>
        </label>
      </Section>

      <Section
        title="C. 안내 본문"
        description="공개 고객과 설계사가 읽는 제목 외 본문입니다. 공식 약관과 주의 사항을 더해 주세요."
      >
        <label className={`${labelClass} md:col-span-2`}>
          개요 요약 (summary)
          <textarea
            className={`${fieldClass} min-h-20`}
            name="summary"
            maxLength={1000}
            defaultValue={claimDocument?.summary ?? ""}
            placeholder="예: 외래 진료비의 일반적인 청구 절차를 안내하는 자료입니다."
          />
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          필수 서류 (requiredDocuments)
          <textarea
            className={`${fieldClass} min-h-28`}
            name="requiredDocuments"
            maxLength={4000}
            defaultValue={claimDocument?.requiredDocuments ?? ""}
            placeholder="각 줄에 하나씩 적어주세요. 필요서류는 보험사 및 약관에 따라 달라질 수 있습니다."
          />
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          선택 서류 (optionalDocuments)
          <textarea
            className={`${fieldClass} min-h-20`}
            name="optionalDocuments"
            maxLength={4000}
            defaultValue={claimDocument?.optionalDocuments ?? ""}
          />
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          주의 사항 (cautionNote)
          <textarea
            className={`${fieldClass} min-h-20`}
            name="cautionNote"
            maxLength={1000}
            defaultValue={claimDocument?.cautionNote ?? ""}
            placeholder="예: 필요서류는 보험사 및 약관에 따라 달라질 수 있습니다."
          />
          <span className={hintClass}>
            이 안내는 일반 절차를 정리한 것으로, 개별 청구 결과를 보장하지 않습니다.
          </span>
        </label>
      </Section>

      <Section
        title="D. 공식 링크"
        description="청구양식 링크와 공식 출처 링크는 공개 전 반드시 검수되었는지 확인해 주세요."
      >
        <label className={labelClass}>
          청구양식 URL (claimFormUrl)
          <input
            className={fieldClass}
            name="claimFormUrl"
            type="url"
            defaultValue={claimDocument?.claimFormUrl ?? ""}
            placeholder={URL_PLACEHOLDER_OPTIONAL}
          />
        </label>

        <label className={labelClass}>
          공식 출처 URL (officialSourceUrl)
          <input
            className={fieldClass}
            name="officialSourceUrl"
            type="url"
            defaultValue={claimDocument?.officialSourceUrl ?? ""}
            placeholder={URL_PLACEHOLDER_OPTIONAL}
          />
          <span className={hintClass}>
            이 레코드를 검수한 보험사 공식 안내·약관·공시 페이지 링크를 입력하세요.
          </span>
        </label>
      </Section>

      <Section
        title="E. 고객용 안내 템플릿"
        description="설계사가 고객에게 보낼 수 있는 이름·메시지 템플릿입니다. 의료 해석이나 지급 약속 표현은 사용하지 마세요."
      >
        <label className={`${labelClass} md:col-span-2`}>
          고객용 메시지 템플릿 (customerMessageTemplate)
          <textarea
            className={`${fieldClass} min-h-24`}
            name="customerMessageTemplate"
            maxLength={2000}
            defaultValue={claimDocument?.customerMessageTemplate ?? ""}
            placeholder="예: 안녕하세요, OO님. 외래 진료 청구 안내드립니다..."
          />
        </label>
      </Section>

      <Section
        title="F. 운영 메타데이터 (Governance)"
        description="정렬 순서와 공개 여부는 이곳에서 관리합니다. 하드 삭제는 제공되지 않습니다."
      >
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
            defaultValue={claimDocument?.sortOrder ?? 0}
          />
          <span className={hintClass}>
            공개 화면에서 때그들 면 논리적 순서를 조정합니다. PR-39 공개 읽기에서 이 값을 참조합니다.
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
            공개 (Published)
          </label>
          <p className="text-xs text-[#5f6875]">
            {ADMIN_CLAIM_DOC_COPY.draftPublishBlocked}
          </p>
        </div>
      </Section>

      <section className="rounded-md border border-[#d9c9a8] bg-[#f7f1e5] p-4 text-xs leading-relaxed text-[#4f5661]">
        <p className="font-semibold text-[#102235]">
          사용이 금지된 표현 (서버 저장 전 자동 검사됩니다)
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
