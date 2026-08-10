import React from 'react';

const stroke = { strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export type OrbitIconName =
  | 'deep'
  | 'body'
  | 'life'
  | 'admin'
  | 'sleep'
  | 'food'
  | 'work';

const paths: Record<OrbitIconName, React.ReactNode> = {
  deep: (
    <>
      <circle cx="12" cy="12" r="3" {...stroke} />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M16.9 16.9l2.1 2.1M4.9 19.1l2.1-2.1M16.9 7.1l2.1-2.1" {...stroke} />
    </>
  ),
  body: (
    <>
      <path d="M12 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" {...stroke} />
      <path d="M8 20v-5l4-3 4 3v5" {...stroke} />
      <path d="M8 11h8" {...stroke} />
    </>
  ),
  life: (
    <>
      <path d="M4 11l8-7 8 7" {...stroke} />
      <path d="M6 10v9h12v-9" {...stroke} />
      <path d="M10 19v-4h4v4" {...stroke} />
    </>
  ),
  admin: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="2" {...stroke} />
      <path d="M9 8h6M9 12h6M9 16h4" {...stroke} />
    </>
  ),
  sleep: (
    <>
      <path d="M21 14A7 7 0 0 1 9 8a7 7 0 1 0 12 6Z" {...stroke} />
    </>
  ),
  food: (
    <>
      <path d="M8 3v8a3 3 0 0 0 6 0V3" {...stroke} />
      <path d="M11 3v18" {...stroke} />
      <path d="M16 7v2a2 2 0 0 0 4 0V3" {...stroke} />
    </>
  ),
  work: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" {...stroke} />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" {...stroke} />
    </>
  ),
};

export const OrbitIcon: React.FC<{ name: OrbitIconName; className?: string }> = ({
  name,
  className = 'w-6 h-6 text-violet-300',
}) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    {paths[name]}
  </svg>
);
