import {
  ACCESS_CELL_LABEL,
  CODE_ROLES,
  FEATURE_ACCESS_ROWS,
  HIGH_RISK_PERMISSION_ROWS,
  PR139_DEFERRED_ITEMS,
  ROLE_ACCESS_FORBIDDEN_DOC_CONTENT,
  ROLE_ACCESS_INTRO,
  ROLE_ACCESS_NO_CHANGE_NOTICE,
  ROUTE_ACCESS_ROWS,
  type AccessCell,
} from "@/lib/auth/role-access-matrix";
import {
  ADMIN_PERMISSION_MATRIX,
  canManageUsers,
  isContentAdmin,
  isSuperAdmin,
  roleDisplayLabel,
} from "@/lib/auth/rbac";
import { borders, shadows, textStyles } from "@/lib/design-system";

const DOC_BASE = "docs/";

const CELL_TONE: Record<AccessCell, string> = {
  allow: "bg-[#edf7f2] text-[#1f6b55]",
  deny: "bg-[#f4f5f6] text-[#4f5661]",
  conditional: "bg-[#fff7e6] text-[#7a612d]",
  admin_only: "bg-[#eef3f7] text-[#102235]",
};

export default function AdminRoleAccessPanel({
  role,
}: {
  role: string | null | undefined;
}) {
  const roleLabel = roleDisplayLabel(role);
  const matrixKey = isSuperAdmin(role)
    ? "super_admin"
    : isContentAdmin(role)
      ? "content_admin"
      : null;
  const perms = matrixKey ? ADMIN_PERMISSION_MATRIX[matrixKey] : null;

  return (
    <section className="mb-8" aria-labelledby="admin-role-access">
      <h2
        id="admin-role-access"
        className="mb-2 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
      >
        역할별 운영 권한 (PR139 · 점검)
      </h2>
      <p className={`mb-3 max-w-3xl ${textStyles.small}`}>{ROLE_ACCESS_INTRO}</p>
      <p className={`mb-4 max-w-3xl text-xs text-[#4f5661]`}>
        {ROLE_ACCESS_NO_CHANGE_NOTICE}
      </p>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-[#d9c9a8] bg-[#f7f1e5] px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#7b5b19]">
            현재 세션 역할
          </p>
          <p className="mt-1 text-lg font-bold text-[#102235]">{roleLabel}</p>
        </div>
        {perms ? (
          <>
            <PermTile
              label="관리자 접근"
              ok={perms.accessAdmin}
            />
            <PermTile
              label="사용자/권한 관리"
              ok={perms.manageUsers}
              warn={!perms.manageUsers}
            />
          </>
        ) : (
          <div className="rounded-lg border border-[#e8c4c4] bg-[#fdf2f2] px-3 py-3 sm:col-span-2">
            <p className="text-xs text-[#8b2e2e]">
              admin 역할이 아닙니다. 이 패널은 getAdminAccess 통과 후에만 표시됩니다.
            </p>
          </div>
        )}
      </div>

      <div className={`overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[52rem] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2 font-semibold text-[#102235]">기능</th>
              <th className="px-3 py-2 font-semibold text-[#102235]">public</th>
              <th className="px-3 py-2 font-semibold text-[#102235]">planner</th>
              <th className="px-3 py-2 font-semibold text-[#102235]">verified</th>
              <th className="px-3 py-2 font-semibold text-[#102235]">content_admin</th>
              <th className="px-3 py-2 font-semibold text-[#102235]">super_admin</th>
            </tr>
          </thead>
          <tbody>
            {FEATURE_ACCESS_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.id}
              >
                <td className="px-3 py-3">
                  <p className="font-semibold text-[#102235]">{row.label}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-[#5f6670]">
                    {row.serverGuard}
                  </p>
                </td>
                {(
                  [
                    "public",
                    "planner",
                    "verified",
                    "content_admin",
                    "super_admin",
                  ] as const
                ).map((col) => (
                  <td className="px-3 py-3" key={col}>
                    <CellBadge cell={row.cells[col]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 mt-6 text-xs font-bold uppercase tracking-wide text-[#4f5661]">
        Route 접근 (서버 guard)
      </h3>
      <div className={`overflow-x-auto rounded-lg border ${borders.default} bg-white`}>
        <table className="min-w-[40rem] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#d6d8dc] bg-[#f4f5f6]">
              <th className="px-3 py-2">경로</th>
              <th className="px-3 py-2">guard</th>
            </tr>
          </thead>
          <tbody>
            {ROUTE_ACCESS_ROWS.map((row) => (
              <tr
                className="border-b border-[#e8eaed] last:border-b-0"
                key={row.path}
              >
                <td className="px-3 py-2 font-mono text-[#102235]">{row.path}</td>
                <td className="px-3 py-2 text-[#4f5661]">{row.guard}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`mt-4 rounded-lg border border-[#e8c4c4] bg-[#fdf2f2] px-4 py-3`}>
        <p className="text-xs font-semibold text-[#8b2e2e]">고위험 권한 (변경 없음 · 확인만)</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[#4f5661]">
          {HIGH_RISK_PERMISSION_ROWS.map((row) => (
            <li key={row.id}>
              <strong>{row.label}</strong> ({row.severity}): {row.rule}
            </li>
          ))}
        </ul>
        {!canManageUsers({ role }) ? (
          <p className="mt-2 text-xs text-[#8b2e2e]">
            현재 역할은 사용자/권한 관리(canManageUsers)에 접근할 수 없습니다.
          </p>
        ) : null}
      </div>

      <details className={`mt-4 rounded-lg border ${borders.default} bg-[#f7f4ee] px-4 py-3`}>
        <summary className="cursor-pointer text-xs font-semibold text-[#102235]">
          코드 역할 목록 · PR139-B 보류 항목
        </summary>
        <ul className="mt-2 space-y-2 text-xs text-[#4f5661]">
          {CODE_ROLES.map((r) => (
            <li key={r.role}>
              <span className="font-mono text-[#102235]">{r.role}</span> — {r.label}:{" "}
              {r.purpose}
            </li>
          ))}
        </ul>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[#4f5661]">
          {PR139_DEFERRED_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-2 font-mono text-[10px] text-[#5f6670]">
          {DOC_BASE}PR-139-B-RBAC-FOUNDATION-DESIGN.md
        </p>
      </details>

      <div
        className={`mt-4 space-y-2 rounded-lg px-4 py-3 ${shadows.card} border ${borders.default} bg-white`}
      >
        <p className="text-xs text-[#4f5661]">
          문서: {DOC_BASE}PR-139-ROLE-ACCESS-OPS.md · PR-139-FEATURE-PERMISSION-MATRIX.md ·
          PR-139-ROUTE-ACCESS-MATRIX.md
        </p>
        <p className="text-xs text-[#4f5661]">{ROLE_ACCESS_FORBIDDEN_DOC_CONTENT}</p>
      </div>
    </section>
  );
}

function CellBadge({ cell }: { cell: AccessCell }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${CELL_TONE[cell]}`}
    >
      {ACCESS_CELL_LABEL[cell]}
    </span>
  );
}

function PermTile({
  label,
  ok,
  warn,
}: {
  label: string;
  ok: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-3 ${
        warn
          ? "border-[#d9c9a8] bg-[#fff7e6]"
          : ok
            ? "border-[#b9d5c9] bg-[#edf7f2]"
            : "border-[#d6d8dc] bg-white"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#4f5661]">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-[#102235]">{ok ? "허용" : "금지"}</p>
    </div>
  );
}
