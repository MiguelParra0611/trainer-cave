export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Cave mound */}
      <path
        d="M3 33 Q3 5 20 5 Q37 5 37 33 Z"
        fill="var(--color-brand-blue)"
      />
      {/* Cave entrance, lit from within */}
      <path
        d="M13 33 Q13 18 20 18 Q27 18 27 33 Z"
        fill="var(--color-brand-gold)"
      />
    </svg>
  );
}
