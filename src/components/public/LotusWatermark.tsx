export function LotusWatermark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <g fill="currentColor" opacity="0.7">
        <ellipse cx="100" cy="120" rx="14" ry="48" />
        <ellipse cx="100" cy="120" rx="14" ry="48" transform="rotate(40 100 120)" />
        <ellipse cx="100" cy="120" rx="14" ry="48" transform="rotate(-40 100 120)" />
        <ellipse cx="100" cy="120" rx="14" ry="48" transform="rotate(80 100 120)" />
        <ellipse cx="100" cy="120" rx="14" ry="48" transform="rotate(-80 100 120)" />
        <circle cx="100" cy="118" r="10" />
      </g>
    </svg>
  );
}