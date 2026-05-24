# PlannerDesk Design System

PlannerDesk is a premium financial editorial SaaS for Korean insurance planners. The interface should feel calm, practical, trustworthy, and built for daily professional use.

## Brand Tone

- Clear and professional
- Warm without becoming casual
- Editorial rather than promotional
- Practical rather than decorative
- Safety-conscious without fear-based warnings

Use Korean copy that helps planners understand scope and verification status. Avoid sensational insurance marketing language.

## Color Usage

Core palette:

- Navy `#102235`: primary hero, structural emphasis, high-trust surfaces
- Deep green `#173f36`: institutional accent, verified or practical action contexts
- Ivory `#fbf7ee`: primary card and content surface
- Cream `#f7f1e5`: page background and muted surfaces
- Deep gray `#303845`: labels and compact UI text
- Body gray `#4f5661`: paragraph copy
- Restrained gold `#aa8137`: editorial accent and primary call-to-action
- Muted border `#d9c9a8`: card, divider, and safety notice borders

Avoid large one-color screens outside intentional navy hero sections. Do not use loud red for ordinary safety guidance; reserve red only for true system errors.

## Typography Guidance

- Use strong hierarchy with restrained sizing.
- Page titles should be large but not marketing-heavy.
- Card headings should stay compact and readable on mobile.
- Body text should use generous line height.
- Avoid negative letter spacing.
- Keep phone numbers, dates, short labels, and badge text from wrapping awkwardly.

## Card And Layout Rules

- Use `PremiumCard` for repeated content items.
- Use `ContentGrid` for responsive two-column page lists.
- Use `PageShell`, `ContentSection`, and `MobileFriendlyPageHeader` for public page structure.
- Keep card borders visible and corners square by default.
- Do not nest cards inside other cards.
- Use white inset panels only for compact field groups inside a larger content card.
- Keep spacing regular: page padding, then section spacing, then card spacing.

## Mobile-First Rules

- Navigation must remain usable on narrow screens.
- Cards should stack to one column on mobile.
- Horizontal overflow is acceptable only for compact navigation chips.
- Avoid dense dashboard layouts for public pages.
- Keep safety notices and verification badges readable before users reach content details.

## Safety Notice Style

Safety notices should use:

- Ivory or cream surface
- Muted border
- Deep gray text
- Restrained gold or deep green accent
- Calm, factual wording

Safety notices must not use:

- Fear-based copy
- Excessive red
- Alarm-like banners
- Claims that PlannerDesk makes payout decisions or medical judgments

Required boundaries:

- PlannerDesk does not judge claim payout.
- PlannerDesk does not estimate claim amount.
- PlannerDesk does not perform loss-adjusting work.
- PlannerDesk does not process customer medical documents in this MVP.
- Claim-related information is for practical reference only.

## Verification Badge Style

Verification labels use `StatusBadge` or `VerificationBadge`:

- `draft`: 초안, cream surface, gold text
- `verified`: 검증 완료, muted green surface, deep green text
- `needs_review`: 재검토 필요, ivory surface, muted brown text

Draft data must remain visibly labeled. Official links, contact details, fax numbers, addresses, and document links must be verified before public release.

## Copywriting Rules

Use:

- "공식 안내 기준으로 확인합니다."
- "공개 전 검증이 필요합니다."
- "실무 참고용입니다."
- "보험사 공식 안내가 우선합니다."

Avoid:

- "지급됩니다"
- "보장됩니다"
- "반드시 받을 수 있습니다"
- "예상 보험금"
- "확정 승인"

## Forbidden Visual Styles

Do not use:

- Cheap link-farm layouts
- Flashy insurance flyer styling
- Cluttered dashboard compositions for public pages
- Sensational marketing tone
- Excessive red warning panels
- Decorative gradient orbs or bokeh backgrounds
- Heavy UI dependencies for simple public content

## Implementation Notes

Design tokens live in `lib/design-system.ts`.

Reusable public UI primitives live in `components/content-page.tsx`:

- `PageShell`
- `ContentSection`
- `MobileFriendlyPageHeader`
- `SectionHeader`
- `PremiumCard`
- `StatusBadge`
- `VerificationBadge`
- `SafetyNotice`
- `EmptyState`
- `LinkButton`
- `ActionButton`
- `ContentGrid`

These components are intentionally small and Tailwind-based so future pages can stay consistent without adding new UI dependencies.
