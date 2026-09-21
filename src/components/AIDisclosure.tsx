import "./ai-disclosure.css";

/** A quiet provenance line beneath media, on the surrounding page surface. */
export function AIDisclosure({
  className = "",
  detail,
  size,
}: {
  className?: string;
  detail?: string;
  size?: number;
}) {
  return (
    <span
      className={`ai-media-disclosure ${className}`.trim()}
      style={size ? { fontSize: size } : undefined}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m10 3 2.2 6.8L19 12l-6.8 2.2L10 21l-2.2-6.8L1 12l6.8-2.2L10 3Z" />
        <path d="m19 2 .8 2.2L22 5l-2.2.8L19 8l-.8-2.2L16 5l2.2-.8L19 2Z" />
      </svg>
      <span>Made with AI{detail ? ` · ${detail}` : ""}</span>
    </span>
  );
}
