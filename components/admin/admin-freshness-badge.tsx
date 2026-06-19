import {
  FreshnessBadge,
  type FreshnessBadgeProps,
} from "@/components/content/freshness-badge";

export function AdminFreshnessBadge(props: FreshnessBadgeProps) {
  return <FreshnessBadge {...props} audience="admin" />;
}
