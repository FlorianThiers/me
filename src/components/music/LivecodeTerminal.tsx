import React, { useEffect, useRef } from 'react';
import { STUDIO } from './studioTheme';

type Props = {
  code: string;
  followLine: number | null;
  followFlash: number;
  onChange: (code: string) => void;
  onEval: () => void;
};

/** Full livecode editor — must fill panel height (no absolute collapse). */
export const LivecodeTerminal: React.FC<Props> = React.memo(
  ({ code, followLine, followFlash, onChange, onEval }) => {
    const taRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (followLine === null || !taRef.current) return;
      const lineH = 18;
      taRef.current.scrollTop = Math.max(0, followLine * lineH - 80);
    }, [followLine, followFlash]);

    return (
      <div className="flex h-full min-h-0 flex-col" style={{ background: STUDIO.bg }}>
        <div
          className="flex h-7 shrink-0 items-center justify-between border-b px-2"
          style={{ borderColor: STUDIO.border }}
        >
          <span className="text-[10px]" style={{ color: STUDIO.textDim }}>
            Livecode · Ctrl+Enter eval · source of truth
          </span>
          <span className="font-mono text-[9px]" style={{ color: STUDIO.textMuted }}>
            {code.split('\n').length} lines
          </span>
        </div>
        <textarea
          ref={taRef}
          value={code}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              onEval();
            }
          }}
          className="min-h-0 w-full flex-1 resize-none border-0 px-3 py-2 font-mono text-[12px] leading-[18px] outline-none"
          style={{
            background: '#0c0c0c',
            color: '#b8e0c8',
            caretColor: STUDIO.accent,
          }}
          placeholder="// project livecode verschijnt hier…"
        />
      </div>
    );
  },
);

LivecodeTerminal.displayName = 'LivecodeTerminal';
