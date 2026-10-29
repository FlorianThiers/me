import React from 'react';
import { X } from 'lucide-react';
import { STUDIO } from './studioTheme';

type Props = {
  title: string;
  short?: string;
  accent?: string;
  visible?: boolean;
  children: React.ReactNode;
  toolbar?: React.ReactNode;
  className?: string;
  onClose?: () => void;
};

/** FL-style docked panel — fixed title bar, no drag chrome */
export const PanelDock: React.FC<Props> = ({
  title,
  short,
  accent = STUDIO.accent,
  visible = true,
  children,
  toolbar,
  className = '',
  onClose,
}) => {
  if (!visible) return null;

  return (
    <div
      className={`flex min-h-0 min-w-0 flex-col overflow-hidden ${className}`}
      style={{ background: STUDIO.panel, borderColor: STUDIO.border }}
    >
      <div
        className="flex h-[22px] shrink-0 items-center gap-2 border-b px-2"
        style={{ background: STUDIO.panelHeader, borderColor: STUDIO.border }}
      >
        <span className="h-[10px] w-[10px] shrink-0 rounded-sm" style={{ background: accent }} />
        {short && (
          <span className="font-mono text-[9px] font-bold uppercase" style={{ color: STUDIO.accent }}>
            {short}
          </span>
        )}
        <span className="truncate text-[10px] font-medium uppercase tracking-wide" style={{ color: STUDIO.text }}>
          {title}
        </span>
        {toolbar && <div className="ml-auto flex items-center gap-1">{toolbar}</div>}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={`flex h-5 w-5 items-center justify-center hover:text-white ${toolbar ? '' : 'ml-auto'}`}
            style={{ color: STUDIO.textDim }}
            title="Close"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
};
