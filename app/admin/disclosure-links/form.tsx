import Link from "next/link";
import type { ReactNode } from "react";
import {
  DisclosureLinkCategory,
  DisclosureLinkStatus,
  DisclosureLinkTargetType,
  type DisclosureLink,
} from "@prisma/client";
import { PROHIBITED_PHRASES } from "@/lib/validators/disclosure-link";
import {
  ADMIN_DISCLOSURE_COPY,
  CATEGORY_LABEL,
  STATUS_LABEL,
  TARGET_TYPE_LABEL,
} from "./visibility";

const fieldClass =
  "mt-1 w-full rounded-md border border-[#d9c9a8] bg-white px-3 py-2 text-sm text-[#102235] outline-none transition focus:border-[#1f6b55] focus:ring-2 focus:ring-[#1f6b55]/15";
const labelClass = "block text-sm font-semibold text-[#102235]";
const hintClass = "mt-1 text-xs leading-relaxed text-[#5f6875]";
const sectionClass =
  "rounded-lg border border-[#e7ddc9] bg-white p-5 shadow-sm sm:p-6";

export interface InsurerOption {
  id: string;
  name: string;
}

interface DisclosureLinkFormProps {
  action: (formData: FormData) => void | Promise<void>;
  link?: DisclosureLink | null;
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

export default function DisclosureLinkForm({
  action,
  link,
  insurers,
  submitLabel,
}: DisclosureLinkFormProps) {
  return (
    <form action={action} className="space-y-6">
      <div className="rounded-md border border-[#d6a36e] bg-[#fff5e1] p-4 text-sm leading-relaxed text-[#7b4b19]">
        <p className="font-semibold">{ADMIN_DISCLOSURE_COPY.guidanceNotice}</p>
        <p className="mt-2 text-[#4f5661]">
          공식 출처 확인용 링크입니다. {ADMIN_DISCLOSURE_COPY.sensitiveNotice}
        </p>
      </div>

      <Section
        title="기본 정보"
        description="제목, 설명, URL, 분류를 입력합니다."
      >
        <label className={`${labelClass} md:col-span-2`}>
          제목
          <input
            className={fieldClass}
            name="title"
            required
            maxLength={200}
            defaultValue={link?.title ?? ""}
          />
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          설명
          <textarea
            className={`${fieldClass} min-h-[120px]`}
            name="description"
            required
            maxLength={4000}
            defaultValue={link?.description ?? ""}
          />
          <span className={hintClass}>
            설계사 참고용 요약입니다. 보험금 지급·보장 여부를 단정하지 마세요.
          </span>
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          URL
          <input
            className={fieldClass}
            name="url"
            required
            type="url"
            defaultValue={link?.url ?? ""}
            placeholder="https://"
          />
        </label>

        <label className={labelClass}>
          카테고리
          <select
            className={fieldClass}
            name="category"
            required
            defaultValue={link?.category ?? DisclosureLinkCategory.other}
          >
            {Object.values(DisclosureLinkCategory).map((value) => (
              <option key={value} value={value}>
                {CATEGORY_LABEL[value]}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          대상 유형
          <select
            className={fieldClass}
            name="targetType"
            required
            defaultValue={link?.targetType ?? DisclosureLinkTargetType.other}
          >
            {Object.values(DisclosureLinkTargetType).map((value) => (
              <option key={value} value={value}>
                {TARGET_TYPE_LABEL[value]}
              </option>
            ))}
          </select>
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          연결 보험사 (보험사 대상일 때)
          <select
            className={fieldClass}
            name="insurerId"
            defaultValue={link?.insurerId ?? ""}
          >
            <option value="">공통 / 비보험사</option>
            {insurers.map((insurer) => (
              <option key={insurer.id} value={insurer.id}>
                {insurer.name}
              </option>
            ))}
          </select>
        </label>
      </Section>

      <Section title="출처·검수" description="공식 출처 여부와 검수 상태를 관리합니다.">
        <label className={labelClass}>
          출처명
          <input
            className={fieldClass}
            name="sourceName"
            maxLength={200}
            defaultValue={link?.sourceName ?? ""}
          />
        </label>

        <label className={labelClass}>
          마지막 검증일
          <input
            className={fieldClass}
            name="lastVerifiedAt"
            type="date"
            defaultValue={formatDateInput(link?.lastVerifiedAt)}
          />
        </label>

        <label className={labelClass}>
          상태
          <select
            className={fieldClass}
            name="status"
            required
            defaultValue={link?.status ?? DisclosureLinkStatus.draft}
          >
            {Object.values(DisclosureLinkStatus).map((value) => (
              <option key={value} value={value}>
                {STATUS_LABEL[value]}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          정렬 순서
          <input
            className={fieldClass}
            name="sortOrder"
            type="number"
            defaultValue={link?.sortOrder ?? 0}
          />
        </label>

        <label className={`${labelClass} flex items-center gap-2 md:col-span-2`}>
          <input
            type="checkbox"
            name="isOfficialSource"
            defaultChecked={link?.isOfficialSource ?? false}
            className="h-4 w-4 rounded border-[#d9c9a8]"
          />
          공식 출처 링크
        </label>

        <label className={`${labelClass} flex items-center gap-2 md:col-span-2`}>
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={link?.isPublished ?? false}
            className="h-4 w-4 rounded border-[#d9c9a8]"
          />
          게시(공개 화면 노출 플래그) — 검수 완료(published) 상태에서만 가능
        </label>
      </Section>

      <Section title="내부 메모" description="관리자 전용. public에 노출되지 않습니다.">
        <label className={`${labelClass} md:col-span-2`}>
          관리자 메모
          <textarea
            className={`${fieldClass} min-h-[80px]`}
            name="adminMemo"
            maxLength={2000}
            defaultValue={link?.adminMemo ?? ""}
          />
        </label>
      </Section>

      <p className="text-xs text-[#5f6875]">
        금지 표현 예: {PROHIBITED_PHRASES.join(", ")}
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-md bg-[#10243E] px-5 py-2.5 text-sm font-semibold text-[#F7F3E8] hover:bg-[#17324F]"
        >
          {submitLabel}
        </button>
        <Link
          href="/admin/disclosure-links"
          className="rounded-md border border-[#d9c9a8] px-5 py-2.5 text-sm font-semibold text-[#102235] hover:bg-[#f7f1e5]"
        >
          목록으로
        </Link>
      </div>
    </form>
  );
}
