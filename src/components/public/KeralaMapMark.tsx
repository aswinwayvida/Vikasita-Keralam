export function KeralaMapMark({ className }: { className?: string }) {
  // Stylised silhouette of Kerala (vertical sliver). Not geographically exact.
  return (
    <svg viewBox="0 0 120 320" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M70 8 C 60 22, 56 40, 60 58 C 64 76, 56 92, 48 110 C 40 130, 38 152, 46 172 C 54 190, 56 210, 50 228 C 42 248, 40 268, 50 286 C 58 300, 70 312, 80 314 C 84 300, 78 286, 76 270 C 74 252, 80 234, 84 216 C 88 196, 84 176, 78 158 C 72 138, 78 120, 86 102 C 94 84, 96 64, 90 46 C 86 30, 82 16, 70 8 Z"
      />
    </svg>
  );
}