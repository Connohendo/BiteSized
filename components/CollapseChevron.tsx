type CollapseChevronProps = {
  expanded: boolean;
  className?: string;
};

export function CollapseChevron({ expanded, className = "" }: CollapseChevronProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 transition-transform duration-150 ${expanded ? "rotate-90" : ""} ${className}`}
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
