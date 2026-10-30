import React from 'react';
import { ExternalLink, X } from 'lucide-react';
import type { AgendaItem } from '../../types/agenda';
import { formatTimeRange } from '../../lib/agendaDates';
import { projectColor, sourceLabel } from '../../lib/agendaColors';

type Props = {
  item: AgendaItem | null;
  onClose: () => void;
};

export const AgendaDetailPanel: React.FC<Props> = ({ item, onClose }) => {
  if (!item) return null;

  const color = projectColor(item.project);

  return (
    <div
      className="fixed inset-x-0 bottom-0 md:inset-auto md:right-6 md:bottom-6 md:w-96 z-50 bg-orbit-deep border border-white/15 rounded-t-2xl md:rounded-2xl shadow-orbit-glow p-5"
      role="dialog"
      aria-label="Agenda detail"
    >
      <div className="flex justify-between items-start gap-3 mb-3">
        <div>
          <p className="text-white/50 text-xs uppercase tracking-wide mb-1">
            {sourceLabel(item.source)}
            {item.isDeadline ? ' · deadline' : ''}
          </p>
          <h3 className="text-white font-semibold leading-snug">{item.title}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-white/50 hover:text-white p-1"
          aria-label="Sluiten"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <p className="text-white/75 text-sm mb-2">{formatTimeRange(item)}</p>
      {item.project && (
        <p className="text-sm mb-2">
          <span className="text-white/45">Project: </span>
          <span style={{ color }}>{item.project}</span>
        </p>
      )}
      {item.planningType && (
        <p className="text-white/60 text-sm mb-2">Planningstype: {item.planningType}</p>
      )}
      {item.status && <p className="text-white/60 text-sm mb-3">Status: {item.status}</p>}
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-orbit-cyan hover:text-neon-blue"
        >
          Open in bron
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
};
