import Link from "next/link";
import type {
  AdminOperationalDashboardSnapshot,
  AdminOperationalMenuCard,
  AdminOperationalMetricCard,
} from "@/lib/admin/operational-dashboard";
import { borders, shadows, surfaces, textStyles } from "@/lib/design-system";

function MetricCard({ card }: { card: AdminOperationalMetricCard }) {
  const displayCount = card.count === null ? "—" : String(card.count);

  return (
    <Link
      className={`block rounded-xl border border-[#d6d8dc] bg-white px-4 py-4 transition hover:border-[#aa8137] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#aa8137]/40 ${shadows.card}`}
      href={card.href}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[#4f5661]">
        {card.title}
      </p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-[#102235]">
        {displayCount}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-[#5f6670]">
        {card.description}
      </p>
    </Link>
  );
}

function MenuCard({ card }: { card: AdminOperationalMenuCard }) {
  return (
    <article
      className={`flex h-full flex-col rounded-xl border border-[#d6d8dc] bg-white p-5 ${shadows.card}`}
    >
      <h3 className="text-base font-bold text-[#102235]">{card.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[#5f6670]">
        {card.description}
      </p>
      <p className="mt-3 text-xs font-semibold text-[#aa8137]">{card.statusCount}</p>
      <Link
        className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#102235] px-4 text-sm font-semibold text-white transition hover:bg-[#16382C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#102235]/30"
        href={card.href}
      >
        {card.buttonLabel}
      </Link>
    </article>
  );
}

export default function AdminOperationalDashboard({
  snapshot,
}: {
  snapshot: AdminOperationalDashboardSnapshot;
}) {
  return (
    <>
      <section
        className={`relative mb-8 overflow-hidden rounded-lg p-6 sm:p-8 ${surfaces.card} ${borders.default} ${shadows.card}`}
      >
        <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-[#aa8137]/5" />
        <p className={textStyles.eyebrow}>PlannerDesk Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102235]">
          관리자 데스크
        </h1>
        <p className={`${textStyles.body} mt-3 max-w-2xl`}>
          운영자가 오늘 확인해야 할 항목을 모아보는 화면입니다.
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5f6670]">
          사용자에게 공개되는 화면과 관리자 검수 화면은 분리됩니다. 전체 목록은
          각 관리 페이지에서 검색·필터·페이지네이션으로 확인하세요.
        </p>
      </section>

      <section aria-labelledby="admin-ops-metrics" className="mb-8">
        <h2
          id="admin-ops-metrics"
          className="mb-3 text-sm font-bold uppercase tracking-wide text-[#aa8137]"
        >
          운영 요약
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {snapshot.metricCards.map((card) => (
            <MetricCard key={card.id} card={card} />
          ))}
        </div>
      </section>

      <section aria-labelledby="admin-today-tasks" className="mb-8">
        <h2
          id="admin-today-tasks"
          className="mb-3 text-lg font-semibold text-[#102235]"
        >
          오늘 처리할 일
        </h2>
        {snapshot.todayTaskGroups.length === 0 ? (
          <p
            className={`rounded-xl border border-[#d6d8dc] bg-white px-4 py-5 text-sm text-[#5f6670] ${shadows.card}`}
          >
            우선 처리할 항목이 없습니다. 각 관리 메뉴에서 검수 상태를
            확인하세요.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {snapshot.todayTaskGroups.map((group) => (
              <article
                key={group.id}
                className={`rounded-xl border border-[#d6d8dc] bg-white p-4 ${shadows.card}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-[#102235]">
                    {group.category}
                  </h3>
                  <Link
                    className="shrink-0 text-xs font-semibold text-[#aa8137] underline underline-offset-2 hover:text-[#7b5b19]"
                    href={group.href}
                  >
                    {group.viewAllLabel}
                  </Link>
                </div>
                <ul className="mt-3 space-y-2">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        className="block rounded-lg border border-[#eceae4] px-3 py-2 text-sm transition hover:border-[#aa8137] hover:bg-[#f8f7f3]"
                        href={item.href}
                      >
                        <span className="font-medium text-[#102235]">
                          {item.label}
                        </span>
                        {item.detail ? (
                          <span className="mt-0.5 block text-xs text-[#5f6670]">
                            {item.detail}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="admin-menu-cards" className="mb-8">
        <h2
          id="admin-menu-cards"
          className="mb-3 text-lg font-semibold text-[#102235]"
        >
          관리 메뉴
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.menuCards.map((card) => (
            <MenuCard key={card.id} card={card} />
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-[#5f6670]">
          지식 아카이브, 공시·약관, 고객 문구 등 추가 관리 영역은{" "}
          <Link
            className="font-semibold text-[#aa8137] underline underline-offset-2"
            href="/admin/search"
          >
            관리자 통합 검색
          </Link>
          또는 아래 고급 운영 계획 문서에서 확인하세요.
        </p>
      </section>
    </>
  );
}
