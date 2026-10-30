import { forwardRef } from 'react';
import type { LucideProps } from 'lucide-react';

/**
 * Urban Culture mark (arc + dot) drawn like Lucide: 24×24, stroke 2, round caps.
 * Geometry scaled from urban-culture-connect.com/icon.svg.
 */
export const UrbanCultureIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ size = 24, className, strokeWidth = 2, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      <path d="M5 6.5V12a7 7 0 0 0 14 0V6.5" />
      <circle cx="12" cy="7.25" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  ),
);

UrbanCultureIcon.displayName = 'UrbanCultureIcon';
