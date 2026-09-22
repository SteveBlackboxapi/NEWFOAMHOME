/** A decorative confirmation mark beside the shared kit's visible status. */
export function KitShareStatus() {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      On its way
      <svg
        viewBox="0 0 28 28"
        width="1.3em"
        height="1.3em"
        className="shrink-0"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M3 8.5H20.5V26H3Z" fill="none" stroke="#101828" />
        <path
          d="M6 16L12 21L25 2"
          fill="none"
          stroke="#54c900"
          strokeWidth="4.5"
        />
      </svg>
    </span>
  );
}
