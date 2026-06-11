type AppIconProps = {
  className?: string;
};

export function AppIcon({ className = 'h-9 w-9' }: AppIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="#2563EB" />
      <rect x="7" y="6" width="13" height="17" rx="2" fill="white" fillOpacity="0.95" />
      <path
        d="M10 10h7M10 13.5h7M10 17h5"
        stroke="#2563EB"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M18 18h7v9a1.5 1.5 0 0 1-1.5 1.5H10.5A1.5 1.5 0 0 1 9 27V21"
        fill="#DC2626"
      />
      <path d="M18 18h5.5a1.5 1.5 0 0 1 1.5 1.5V27" fill="#EF4444" />
      <text
        x="13.5"
        y="25.5"
        fontFamily="system-ui, sans-serif"
        fontSize="5.5"
        fontWeight="700"
        fill="white"
        textAnchor="middle"
      >
        PDF
      </text>
    </svg>
  );
}
