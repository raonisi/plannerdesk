import Link from "next/link";
import type { ReactNode } from "react";
import {
  KnowledgeArticleCategory,
  KnowledgeArticleStatus,
  KnowledgeArticleType,
  KnowledgeRiskLevel,
  KnowledgeSourceType,
  type KnowledgeArticle,
} from "@prisma/client";
import { PROHIBITED_PHRASES } from "@/lib/validators/knowledge-article";
import {
  ADMIN_KNOWLEDGE_COPY,
  CATEGORY_OPTIONS,
  TYPE_OPTIONS,
  WRITABLE_STATUSES,
  STATUS_LABEL,
  RISK_LABEL,
  SOURCE_TYPE_LABEL,
} from "./visibility";
import { KNOWLEDGE_REGISTRATION_STEPS } from "@/lib/knowledge/workflow-labels";

const fieldClass =
  "mt-1 w-full rounded-md border border-[#d9c9a8] bg-white px-3 py-2 text-sm text-[#102235] outline-none transition focus:border-[#1f6b55] focus:ring-2 focus:ring-[#1f6b55]/15";
const labelClass = "block text-sm font-semibold text-[#102235]";
const hintClass = "mt-1 text-xs leading-relaxed text-[#5f6875]";
const sectionClass =
  "rounded-lg border border-[#e7ddc9] bg-white p-5 shadow-sm sm:p-6";
const sectionTitleClass = "text-base font-semibold text-[#102235]";
const sectionDescClass = "mt-1 text-xs leading-relaxed text-[#5f6875]";

interface KnowledgeArticleFormProps {
  action: (formData: FormData) => void | Promise<void>;
  article?: KnowledgeArticle | null;
  submitLabel: string;
}

function formatDateInput(value: Date | null | undefined) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

function formatList(value: string[]) {
  return value.join(", ");
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

export default function KnowledgeArticleForm({
  action,
  article,
  submitLabel,
}: KnowledgeArticleFormProps) {
  const isVerified =
    article?.status === KnowledgeArticleStatus.verified ||
    false;

  return (
    <form action={action} className="space-y-6">
      <div className="rounded-md border border-[#d6a36e] bg-[#fff5e1] p-4 text-sm leading-relaxed text-[#7b4b19]">
        <p className="font-semibold">{ADMIN_KNOWLEDGE_COPY.guidanceNotice}</p>
        <p className="mt-1 text-[#4f5661]">
          PlannerDesk는 보험금 지급 금액을 산정하지 않습니다. 손해사정 업무를
          수행하지 않으며, 의료 진단을 해석하지 않습니다.
        </p>
        <p className="mt-2 text-[#4f5661]">{ADMIN_KNOWLEDGE_COPY.sensitiveNotice}</p>
        <p className="mt-2 text-xs text-[#4f5661]">{ADMIN_KNOWLEDGE_COPY.aiGuidance}</p>
      </div>

      <Section title="A. 기본 정보" description="제목, 슬러그, 분류, 태그를 관리합니다.">
        <label className={`${labelClass} md:col-span-2`}>
          제목
          <input
            className={fieldClass}
            name="title"
            required
            maxLength={200}
            defaultValue={article?.title ?? ""}
          />
        </label>

        <label className={labelClass}>
          슬러그 (URL 경로)
          <input
            className={fieldClass}
            name="slug"
            required
            maxLength={120}
            defaultValue={article?.slug ?? ""}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          />
          <span className={hintClass}>소문자, 숫자, 하이픈(-)만 사용합니다.</span>
        </label>

        <label className={labelClass}>
          요약
          <input
            className={fieldClass}
            name="summary"
            required
            maxLength={1000}
            defaultValue={article?.summary ?? ""}
          />
        </label>

        <label className={labelClass}>
          카테고리
          <select
            className={fieldClass}
            name="category"
            required
            defaultValue={
              article?.category ?? KnowledgeArticleCategory.claim
            }
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          문서 유형
          <select
            className={fieldClass}
            name="type"
            required
            defaultValue={article?.type ?? KnowledgeArticleType.faq}
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          위험도
          <select
            className={fieldClass}
            name="riskLevel"
            defaultValue={article?.riskLevel ?? KnowledgeRiskLevel.medium}
          >
            {Object.values(KnowledgeRiskLevel).map((value) => (
              <option key={value} value={value}>
                {RISK_LABEL[value]}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          워크플로 라벨
          <input
            className={fieldClass}
            name="workflowLabel"
            maxLength={120}
            defaultValue={article?.workflowLabel ?? ""}
          />
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          태그 (쉼표 구분)
          <input
            className={fieldClass}
            name="tags"
            defaultValue={formatList(article?.tags ?? [])}
            placeholder="청구, 공식출처, 고객안내"
          />
        </label>
      </Section>

      <Section title="B. 본문" description="설계사 실무 참고용 텍스트만 입력합니다.">
        <label className={`${labelClass} md:col-span-2`}>
          본문
          <textarea
            className={`${fieldClass} min-h-48`}
            name="content"
            required
            maxLength={50000}
            defaultValue={article?.content ?? ""}
          />
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          안전 문구 (safeCopy)
          <textarea
            className={`${fieldClass} min-h-24`}
            name="safeCopy"
            maxLength={10000}
            defaultValue={article?.safeCopy ?? ""}
          />
          <span className={hintClass}>
            공개 시 사용할 수 있는 대체 표현을 정리합니다.
          </span>
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          금지 주장 (쉼표 구분)
          <input
            className={fieldClass}
            name="forbiddenClaims"
            defaultValue={formatList(article?.forbiddenClaims ?? [])}
            placeholder="지급 확정, 업로드 요청"
          />
        </label>
      </Section>

      <Section title="C. 출처" description="URL은 저장만 하며 자동 수집하지 않습니다.">
        <label className={labelClass}>
          출처 유형
          <select
            className={fieldClass}
            name="sourceType"
            defaultValue={article?.sourceType ?? KnowledgeSourceType.internal}
          >
            {Object.values(KnowledgeSourceType).map((value) => (
              <option key={value} value={value}>
                {SOURCE_TYPE_LABEL[value]}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          출처 확인일
          <input
            className={fieldClass}
            type="date"
            name="sourceCheckedAt"
            defaultValue={formatDateInput(article?.sourceCheckedAt)}
          />
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          출처 제목
          <input
            className={fieldClass}
            name="sourceTitle"
            maxLength={200}
            defaultValue={article?.sourceTitle ?? ""}
          />
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          출처 URL
          <input
            className={fieldClass}
            name="sourceUrl"
            type="url"
            defaultValue={article?.sourceUrl ?? ""}
            placeholder="https://"
          />
        </label>
      </Section>

      <Section
        title="D. 공개·검수 설정"
        description="등록 후 검수 대기 → 공개 가능 → 게시 순으로 운영합니다. 미검수·비공개 문서는 public에 노출되지 않습니다."
      >
        <div className="md:col-span-2 rounded-md border border-[#e7ddc9] bg-[#f7f1e5] px-4 py-3">
          <p className="text-xs font-semibold text-[#102235]">등록·검수 순서</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs leading-relaxed text-[#4f5661]">
            {KNOWLEDGE_REGISTRATION_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <label className={labelClass}>
          검수 상태
          <select
            className={fieldClass}
            name="status"
            defaultValue={article?.status ?? KnowledgeArticleStatus.draft}
          >
            {WRITABLE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABEL[value]}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-3 md:col-span-2">
          <label className="flex items-center gap-2 text-sm text-[#102235]">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={article?.isPublished ?? false}
              className="h-4 w-4 rounded border-[#d9c9a8]"
            />
            공개(게시) — 검수 대기 또는 공개 가능 상태에서만 공개 화면 후보
          </label>
          <label className="flex items-center gap-2 text-sm text-[#102235]">
            <input
              type="checkbox"
              name="aiUsable"
              defaultChecked={article?.aiUsable ?? false}
              disabled={!isVerified}
              className="h-4 w-4 rounded border-[#d9c9a8] disabled:opacity-50"
            />
            AI 참조 가능 — 공개 가능(verified) 상태에서만 설정 가능
          </label>
          <p className={hintClass}>{ADMIN_KNOWLEDGE_COPY.draftRule}</p>
        </div>
      </Section>

      <div className="rounded-md border border-[#c8d2dc] bg-[#eef3f7] p-4 text-xs text-[#4f5661]">
        <p className="font-semibold text-[#102235]">금지 표현 예시</p>
        <p className="mt-1">{PROHIBITED_PHRASES.slice(0, 6).join(" · ")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-md bg-[#10243E] px-5 py-2.5 text-sm font-semibold text-[#F7F3E8] shadow-sm transition hover:bg-[#17324F] focus:outline-none focus:ring-2 focus:ring-[#B8924A]"
        >
          {submitLabel}
        </button>
        <Link
          href="/admin/knowledge"
          className="rounded-md border border-[#d9c9a8] px-5 py-2.5 text-sm font-semibold text-[#102235] transition hover:bg-[#f7f1e5]"
        >
          목록으로
        </Link>
      </div>
    </form>
  );
}
