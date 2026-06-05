export function Logo({
  className = "",
  showWord = true,
}: {
  className?: string;
  showWord?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width="34"
        height="34"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <circle cx="32" cy="30" r="24" stroke="currentColor" strokeWidth="3.5" fill="none" />
        <path
          d="M15 41 A17 17 0 0 1 49 41 Z"
          stroke="#bd7b54"
          strokeWidth="3.5"
          fill="none"
          strokeLinejoin="round"
        />
        <line x1="12" y1="41" x2="52" y2="41" stroke="#bd7b54" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="32" y1="30" x2="32" y2="15" stroke="#bd7b54" strokeWidth="3" strokeLinecap="round" />
        <line x1="32" y1="30" x2="47" y2="43" stroke="#bd7b54" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="30" r="2.4" fill="#bd7b54" />
      </svg>
      {showWord && (
        <span className="text-xl font-bold tracking-widest text-navy">DUTI</span>
      )}
    </span>
  );
}
