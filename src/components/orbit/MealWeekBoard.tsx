import React from 'react';
import { useTranslation } from 'react-i18next';
import type { JuliaMealPlanSlot } from '../../types/juliaSnapshot';

type Props = {
  slots: JuliaMealPlanSlot[];
  today?: string;
  compact?: boolean;
};

function dayLabel(dateStr: string, today: string | undefined, locale: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  const opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
  const label = d.toLocaleDateString(locale, opts);
  if (today && dateStr === today) return `${label} · vandaag`;
  return label;
}

export const MealWeekBoard: React.FC<Props> = ({ slots, today, compact = false }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith('nl') ? 'nl-BE' : i18n.language || 'en';

  if (!slots.length) {
    return (
      <p className="text-white/50 text-sm">{t('julia.mealPlan.empty')}</p>
    );
  }

  const byDate = slots.reduce<Record<string, JuliaMealPlanSlot[]>>((acc, slot) => {
    (acc[slot.date] ||= []).push(slot);
    return acc;
  }, {});

  return (
    <div className={`space-y-3 ${compact ? '' : 'md:space-y-4'}`}>
      {Object.entries(byDate).map(([date, daySlots]) => (
        <div
          key={date}
          className={`rounded-xl border ${
            today && date === today ? 'border-orbit-cyan/40 bg-orbit-cyan/5' : 'border-white/10 bg-black/20'
          } p-3`}
        >
          <p className="text-[10px] uppercase tracking-wider text-white/45 mb-2">
            {dayLabel(date, today, locale)}
          </p>
          <ul className="space-y-2">
            {daySlots.map((slot) => (
              <li key={`${slot.date}-${slot.type}-${slot.title}`} className="flex justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <span className="text-orbit-cyan/80 text-xs mr-2">{slot.type}</span>
                  <span className="text-white/90">{slot.title}</span>
                </div>
                <div className="text-right shrink-0 text-xs text-white/45">
                  {slot.kcal != null && <span>{Math.round(slot.kcal)} kcal</span>}
                  {slot.proteinG != null && (
                    <span className="block">{Math.round(slot.proteinG)}g eiwit</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
