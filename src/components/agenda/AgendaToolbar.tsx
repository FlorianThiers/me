import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AgendaViewMode } from '../../types/agenda';

type Props = {
  view: AgendaViewMode;
  title: string;
  onViewChange: (view: AgendaViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onLogout: () => void;
  loading?: boolean;
};

export const AgendaToolbar: React.FC<Props> = ({
  view,
  title,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  onLogout,
  loading,
}) => (
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
    <div>
      <h1 className="text-3xl font-bold text-white">Agenda</h1>
      <p className="text-white/55 text-sm mt-1">
        {title}
        {loading ? ' · laden…' : ''}
      </p>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-lg border border-white/10 overflow-hidden">
        <button
          type="button"
          onClick={() => onViewChange('week')}
          className={`px-3 py-1.5 text-sm ${
            view === 'week' ? 'bg-orbit-violet/40 text-white' : 'text-white/60 hover:text-white'
          }`}
        >
          Week
        </button>
        <button
          type="button"
          onClick={() => onViewChange('month')}
          className={`px-3 py-1.5 text-sm border-l border-white/10 ${
            view === 'month' ? 'bg-orbit-violet/40 text-white' : 'text-white/60 hover:text-white'
          }`}
        >
          Maand
        </button>
      </div>
      <button
        type="button"
        onClick={onPrev}
        className="p-2 rounded-lg border border-white/10 text-white/70 hover:text-white hover:border-white/25"
        aria-label="Vorige"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={onToday}
        className="px-3 py-1.5 text-sm rounded-lg border border-white/10 text-white/80 hover:border-orbit-violet/40"
      >
        Vandaag
      </button>
      <button
        type="button"
        onClick={onNext}
        className="p-2 rounded-lg border border-white/10 text-white/70 hover:text-white hover:border-white/25"
        aria-label="Volgende"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={onLogout}
        className="px-3 py-1.5 text-sm rounded-lg text-white/50 hover:text-white border border-transparent hover:border-white/15 ml-1"
      >
        Uitloggen
      </button>
    </div>
  </div>
);
