import React from 'react';

export const OrbitPanel: React.FC<{
  title: string;
  titleClassName?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, titleClassName = 'text-neon-blue', children, className = '' }) => (
  <div
    className={`bg-orbit-surface border border-orbit-violet/20 rounded-2xl p-6 backdrop-blur-sm ${className}`}
  >
    <h2 className={`font-semibold text-sm uppercase tracking-wider mb-4 ${titleClassName}`}>{title}</h2>
    {children}
  </div>
);
