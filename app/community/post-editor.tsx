import type { CommunityPostCategory, CommunityPostVisibility } from "@prisma/client";
import { CommunityPostVisibility as CommunityPostVisibilityEnum } from "@prisma/client";
import { CATEGORY_LABEL, COMMUNITY_COPY, VISIBILITY_LABEL } from "./visibility";

export type CommunityEditorInitial = {
  category: CommunityPostCategory;
  title: string;
  content: string;
  visibility: CommunityPostVisibility;
  isPinned: boolean;
};

export default function CommunityPostEditor({
  initial,
  isAdmin,
  submitLabel,
  action,
}: {
  initial: CommunityEditorInitial;
  isAdmin: boolean;
  submitLabel: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action} className="space-y-4 rounded-lg border border-[#d9c9a8] bg-white p-5">
      <p className="rounded-md border border-[#c8d2dc] bg-[#eef3f7] px-3 py-2 text-sm text-[#102235]">
        {COMMUNITY_COPY.writeNotice}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-[#303845]">
          카테고리
          <select
            name="category"
            defaultValue={initial.category}
            className="mt-1 min-h-11 w-full rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
          >
            {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        {isAdmin ? (
          <label className="text-sm text-[#303845]">
            공개 범위
            <select
              name="visibility"
              defaultValue={initial.visibility}
              className="mt-1 min-h-11 w-full rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
            >
              {Object.entries(VISIBILITY_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <input type="hidden" name="visibility" value={CommunityPostVisibilityEnum.verified_only} />
        )}
      </div>

      {isAdmin ? (
        <label className="inline-flex items-center gap-2 text-sm text-[#303845]">
          <input type="checkbox" name="isPinned" value="true" defaultChecked={initial.isPinned} />
          고정글로 표시
        </label>
      ) : null}

      <label className="block text-sm text-[#303845]">
        제목
        <input
          name="title"
          defaultValue={initial.title}
          minLength={5}
          maxLength={100}
          required
          className="mt-1 min-h-11 w-full rounded-md border border-[#d9c9a8] bg-white px-3 text-sm"
          placeholder="제목을 입력하세요 (5~100자)"
        />
      </label>

      <label className="block text-sm text-[#303845]">
        본문
        <textarea
          name="content"
          defaultValue={initial.content}
          minLength={20}
          maxLength={5000}
          required
          className="mt-1 min-h-64 w-full rounded-md border border-[#d9c9a8] bg-white px-3 py-2 text-sm leading-6"
          placeholder="실무 기준 중심으로 작성해 주세요 (20~5000자)"
        />
      </label>

      <button
        type="submit"
        className="min-h-11 rounded-md bg-[#10243E] px-5 text-sm font-semibold text-[#F7F3E8]"
      >
        {submitLabel}
      </button>
    </form>
  );
}

