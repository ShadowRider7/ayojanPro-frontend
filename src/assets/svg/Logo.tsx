type LogoProps = {
  className?: string;
};

/**
 * AyojanPro mark — a minimal "A" glyph. Decorative: always rendered next to
 * the wordmark, so it is hidden from assistive technology.
 */
export default function Logo({ className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M20 4.5 36.5 35.5h-8.9L20 21.3 12.4 35.5H3.5L20 4.5Z"
        fill="currentColor"
      />
      <path
        d="M12.4 26h15.2v4.6H12.4Z"
        fill="currentColor"
        fillOpacity="0.55"
      />
    </svg>
  );
}
