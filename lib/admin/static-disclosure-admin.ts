import type { DisclosureLinkEntry, VerificationStatus } from "@/lib/content";

/** Editorial publish flag for admin/bulk UI until DisclosureLink DB exists. */
export function inferDisclosureIsPublished(
  verificationStatus: VerificationStatus,
): boolean {
  return (
    verificationStatus === "verified" || verificationStatus === "needs_review"
  );
}

export function isDisclosurePubliclyVisibleStatic(entry: DisclosureLinkEntry): boolean {
  return inferDisclosureIsPublished(entry.verificationStatus);
}

export function filterDisclosureEntries(
  entries: DisclosureLinkEntry[],
  params: {
    q?: string;
    category?: string;
    status?: string;
    published?: string;
  },
): DisclosureLinkEntry[] {
  const query = params.q?.trim().toLocaleLowerCase("ko-KR");

  return entries.filter((entry) => {
    if (query) {
      const haystack = [
        entry.title,
        entry.description,
        entry.notes ?? "",
        entry.id,
      ]
        .join(" ")
        .toLocaleLowerCase("ko-KR");
      if (!haystack.includes(query)) return false;
    }

    if (params.category && params.category !== "all") {
      if (entry.category !== params.category) return false;
    }

    if (
      params.status &&
      params.status !== "all" &&
      entry.verificationStatus !== params.status
    ) {
      return false;
    }

    const isPublished = inferDisclosureIsPublished(entry.verificationStatus);
    if (params.published === "true" && !isPublished) return false;
    if (params.published === "false" && isPublished) return false;

    return true;
  });
}
