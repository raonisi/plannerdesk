import Link from "next/link";
import type { ReactNode } from "react";
import {
  MessageTemplateAudienceType,
  MessageTemplateCategory,
  MessageTemplateChannel,
  MessageTemplateRiskLevel,
  MessageTemplateStatus,
  MessageTemplateTone,
  type MessageTemplate,
} from "@prisma/client";
import {
  ALLOWED_TEMPLATE_VARIABLES,
  MESSAGE_TEMPLATE_PROHIBITED_PHRASES,
} from "@/lib/message-template/safety";
import {
  ADMIN_MESSAGE_TEMPLATE_COPY,
  AUDIENCE_LABEL,
  CATEGORY_LABEL,
  CHANNEL_LABEL,
  RISK_LABEL,
  STATUS_LABEL,
  TONE_LABEL,
} from "./visibility";

const fieldClass =
  "mt-1 w-full rounded-md border border-[#d9c9a8] bg-white px-3 py-2 text-sm text-[#102235] outline-none transition focus:border-[#1f6b55] focus:ring-2 focus:ring-[#1f6b55]/15";
const labelClass = "block text-sm font-semibold text-[#102235]";
const hintClass = "mt-1 text-xs leading-relaxed text-[#5f6875]";
const sectionClass =
  "rounded-lg border border-[#e7ddc9] bg-white p-5 shadow-sm sm:p-6";

interface MessageTemplateFormProps {
  action: (formData: FormData) => void | Promise<void>;
  template?: MessageTemplate | null;
  submitLabel: string;
}

function formatList(values: string[]) {
  return values.join(", ");
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
        <h2 className="text-base font-semibold text-[#102235]">{title}</h2>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-[#5f6875]">
            {description}
          </p>
        ) : null}
      </header>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

export default function MessageTemplateForm({
  action,
  template,
  submitLabel,
}: MessageTemplateFormProps) {
  return (
    <form action={action} className="space-y-6">
      <div className="rounded-md border border-[#d6a36e] bg-[#fff5e1] p-4 text-sm leading-relaxed text-[#7b4b19]">
        <p className="font-semibold">{ADMIN_MESSAGE_TEMPLATE_COPY.guidanceNotice}</p>
        <p className="mt-2 text-[#4f5661]">
          고객 발송용 중립 안내 문구입니다. {ADMIN_MESSAGE_TEMPLATE_COPY.sensitiveNotice}
        </p>
      </div>

      <Section title="기본 정보" description="제목, 설명, 사용 상황을 입력합니다.">
        <label className={`${labelClass} md:col-span-2`}>
          제목
          <input
            className={fieldClass}
            name="title"
            required
            maxLength={200}
            defaultValue={template?.title ?? ""}
          />
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          설명
          <textarea
            className={`${fieldClass} min-h-[80px]`}
            name="description"
            maxLength={4000}
            defaultValue={template?.description ?? ""}
          />
          <span className={hintClass}>설계사 참고용 요약입니다.</span>
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          사용 상황
          <textarea
            className={`${fieldClass} min-h-[80px]`}
            name="useCase"
            required
            maxLength={2000}
            defaultValue={template?.useCase ?? ""}
          />
        </label>
      </Section>

      <Section title="분류·채널" description="카테고리, 채널, 대상, 톤, 위험도를 선택합니다.">
        <label className={labelClass}>
          카테고리
          <select
            className={fieldClass}
            name="category"
            required
            defaultValue={template?.category ?? MessageTemplateCategory.other}
          >
            {Object.values(MessageTemplateCategory).map((value) => (
              <option key={value} value={value}>
                {CATEGORY_LABEL[value]}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          채널
          <select
            className={fieldClass}
            name="channel"
            required
            defaultValue={template?.channel ?? MessageTemplateChannel.general}
          >
            {Object.values(MessageTemplateChannel).map((value) => (
              <option key={value} value={value}>
                {CHANNEL_LABEL[value]}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          대상 고객 유형
          <select
            className={fieldClass}
            name="audienceType"
            required
            defaultValue={
              template?.audienceType ?? MessageTemplateAudienceType.general
            }
          >
            {Object.values(MessageTemplateAudienceType).map((value) => (
              <option key={value} value={value}>
                {AUDIENCE_LABEL[value]}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          톤
          <select
            className={fieldClass}
            name="tone"
            required
            defaultValue={template?.tone ?? MessageTemplateTone.neutral}
          >
            {Object.values(MessageTemplateTone).map((value) => (
              <option key={value} value={value}>
                {TONE_LABEL[value]}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          위험도
          <select
            className={fieldClass}
            name="riskLevel"
            required
            defaultValue={template?.riskLevel ?? MessageTemplateRiskLevel.medium}
          >
            {Object.values(MessageTemplateRiskLevel).map((value) => (
              <option key={value} value={value}>
                {RISK_LABEL[value]}
              </option>
            ))}
          </select>
          <span className={hintClass}>
            HIGH는 검수·안전 문구 확인 후에만 public 게시할 수 있습니다.
          </span>
        </label>

        <label className={labelClass}>
          정렬 순서
          <input
            className={fieldClass}
            name="sortOrder"
            type="number"
            defaultValue={template?.sortOrder ?? 0}
          />
        </label>
      </Section>

      <Section
        title="문구 본문"
        description="실제 고객 개인정보·의료정보·계약번호는 저장하지 마세요. 변수는 허용 목록만 사용합니다."
      >
        <label className={`${labelClass} md:col-span-2`}>
          본문 (body)
          <textarea
            className={`${fieldClass} min-h-[160px] font-mono text-xs`}
            name="body"
            required
            maxLength={20000}
            defaultValue={template?.body ?? ""}
          />
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          안전 문구 (safeCopy)
          <textarea
            className={`${fieldClass} min-h-[120px] font-mono text-xs`}
            name="safeCopy"
            maxLength={20000}
            defaultValue={template?.safeCopy ?? ""}
          />
          <span className={hintClass}>
            public 게시 시 필수입니다. 본문과 비교 검수용 최종 안전 문구입니다.
          </span>
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          허용 변수 (쉼표·줄바꿈 구분)
          <textarea
            className={`${fieldClass} min-h-[72px] font-mono text-xs`}
            name="allowedVariables"
            defaultValue={formatList(template?.allowedVariables ?? [])}
            placeholder={ALLOWED_TEMPLATE_VARIABLES.join(", ")}
          />
          <span className={hintClass}>
            허용: {ALLOWED_TEMPLATE_VARIABLES.join(", ")} · 연락처는 설계사/회사
            대표번호 용도만
          </span>
        </label>
      </Section>

      <Section title="검수·컴플라이언스" description="관리자 전용 필드입니다. public에 노출되지 않습니다.">
        <label className={`${labelClass} md:col-span-2`}>
          금지 표현 (forbiddenClaims)
          <textarea
            className={`${fieldClass} min-h-[72px]`}
            name="forbiddenClaims"
            defaultValue={formatList(template?.forbiddenClaims ?? [])}
          />
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          컴플라이언스 메모
          <textarea
            className={`${fieldClass} min-h-[96px]`}
            name="complianceNote"
            maxLength={4000}
            defaultValue={template?.complianceNote ?? ""}
          />
        </label>

        <div className="md:col-span-2 rounded-md border border-[#e7ddc9] bg-[#faf8f3] p-3 text-xs text-[#4f5661]">
          <p className="font-semibold text-[#102235]">자동 차단 금지 표현 예시</p>
          <p className="mt-1">{MESSAGE_TEMPLATE_PROHIBITED_PHRASES.slice(0, 6).join(" · ")} …</p>
        </div>
      </Section>

      <Section title="상태·공개" description={ADMIN_MESSAGE_TEMPLATE_COPY.policySummary}>
        <label className={labelClass}>
          상태
          <select
            className={fieldClass}
            name="status"
            required
            defaultValue={template?.status ?? MessageTemplateStatus.draft}
          >
            {Object.values(MessageTemplateStatus).map((value) => (
              <option key={value} value={value}>
                {STATUS_LABEL[value]}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-3 md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#102235]">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={template?.isPublished ?? false}
              className="h-4 w-4 rounded border-[#d9c9a8]"
            />
            게시 중 (isPublished)
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-[#102235]">
            <input
              type="checkbox"
              name="isInternalOnly"
              defaultChecked={template?.isInternalOnly ?? false}
              className="h-4 w-4 rounded border-[#d9c9a8]"
            />
            내부 전용 (public 미노출)
          </label>
        </div>
      </Section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="min-h-11 rounded-md bg-[#10243E] px-5 text-sm font-semibold text-[#F7F3E8]"
        >
          {submitLabel}
        </button>
        <Link
          href="/admin/message-templates"
          className="inline-flex min-h-11 items-center rounded-md border border-[#d9c9a8] px-5 text-sm font-semibold text-[#102235] hover:bg-[#f7f1e5]"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
