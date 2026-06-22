/** Shared id for skip navigation and the public page main landmark. */
export const MAIN_CONTENT_ID = "main-content";

export function SkipToContent() {
  return (
    <a className="skip-to-content" href={`#${MAIN_CONTENT_ID}`}>
      본문으로 바로가기
    </a>
  );
}

export const publicMainLandmarkProps = {
  id: MAIN_CONTENT_ID,
  tabIndex: -1,
} as const;
