import {
  EmptyState,
  type EmptyStateAction,
} from "@/components/public/empty-state";

export function EmptyStatePanel({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: Array<{ href: string; label: string; variant?: "primary" | "outline" }>;
}) {
  const mappedActions: EmptyStateAction[] | undefined = actions?.map((action) => ({
    href: action.href,
    label: action.label,
    variant: action.variant,
  }));

  return (
    <EmptyState
      actions={mappedActions}
      description={description}
      title={title}
      variant="compact"
    />
  );
}
