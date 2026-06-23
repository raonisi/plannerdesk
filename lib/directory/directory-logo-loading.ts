/**
 * Directory list logo loading hints for above-the-fold insurers.
 */

export const DIRECTORY_VISIBLE_EAGER_LOGO_COUNT = 6;
export const DIRECTORY_VISIBLE_PRIORITY_LOGO_COUNT = 3;

export type DirectoryLogoLoadingProps = {
  loading: "lazy" | "eager";
  fetchPriority?: "high";
};

export function directoryLogoLoadingProps(
  index: number,
): DirectoryLogoLoadingProps {
  const loading =
    index < DIRECTORY_VISIBLE_EAGER_LOGO_COUNT ? "eager" : "lazy";
  const fetchPriority =
    index < DIRECTORY_VISIBLE_PRIORITY_LOGO_COUNT ? "high" : undefined;
  return fetchPriority ? { loading, fetchPriority } : { loading };
}
