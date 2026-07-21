interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Simplified hub-and-spoke mark: a bold hexagon frame around a center hub
 * with three outer nodes, in a single ink color (evidence-stamp restraint —
 * the ticker tape and bracket panels carry the page's color energy, not the
 * logo). Kept low-detail so it stays crisp at the ~24-32px nav sizes.
 */
export function Logo({ size = 32, className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
    >
      <path
        d="M100 14 L176 50 L176 126 L100 162 L24 126 L24 50 Z"
        stroke="#ffb545"
        strokeWidth="11"
        strokeLinejoin="round"
        fill="none"
      />
      <line x1="100" y1="103" x2="100" y2="56" stroke="#ffb545" strokeWidth="9" strokeLinecap="round" />
      <line x1="100" y1="103" x2="62" y2="129" stroke="#ffb545" strokeWidth="9" strokeLinecap="round" opacity=".55" />
      <line x1="100" y1="103" x2="138" y2="129" stroke="#ffb545" strokeWidth="9" strokeLinecap="round" opacity=".55" />
      <circle cx="100" cy="56" r="13" fill="#ffb545" />
      <circle cx="62" cy="129" r="13" fill="#ffb545" opacity=".55" />
      <circle cx="138" cy="129" r="13" fill="#ffb545" opacity=".55" />
      <circle cx="100" cy="103" r="16" fill="#ffb545" />
    </svg>
  );
}
