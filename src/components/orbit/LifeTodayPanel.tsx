import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, UtensilsCrossed, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { JuliaLifeSnapshot, JuliaSnapshot } from '../../types/juliaSnapshot';
import { LifeNutritionRings } from './LifeNutritionRings';
import { LifeMicroGaps } from './LifeMicroGaps';
import { OrbitIcon } from './icons/OrbitIcons';

type Props = {
  life: JuliaLifeSnapshot | undefined;
  links: JuliaSnapshot['links'];
  nutritionAnchor: number;
  isDemo: boolean;
  compact?: boolean;
  showRings?: boolean;
};

export const LifeTodayPanel: React.FC<Props> = ({
  life,
  links,
  nutritionAnchor,
  isDemo,
  compact = false,
  showRings = true,
}) => {
  const { t } = useTranslation();

  if (!life && isDemo) {
    return <p className="text-white/85 text-sm">{t('julia.demo.lifeTeaser')}</p>;
  }

  if (!life) {
    return <p className="text-white/60 text-sm">{t('julia.lifeToday.noData')}</p>;
  }

  const meal =
    life.mealTonight ?? life.mealLunch ?? (isDemo ? null : t('julia.lifeToday.noMealPlanned'));

  return (
    <div className="space-y-4">
      {meal && (
        <div className="flex gap-2 items-start">
          <UtensilsCrossed className="w-4 h-4 text-neon-green shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/45 mb-0.5">
              {life.mealTonight ? t('julia.lifeToday.mealTonight') : t('julia.lifeToday.mealToday')}
            </p>
            <p className="text-white/90 text-sm font-medium leading-snug">{meal}</p>
          </div>
        </div>
      )}

      {showRings && <LifeNutritionRings life={life} compact={compact} />}

      {compact && !showRings && (life.proteinG > 0 || life.waterL > 0 || (life.kcal ?? 0) > 0) && (
        <p className="text-xs text-white/55 text-center">
          {Math.round(life.proteinG)}g {t('julia.lifeToday.protein').toLowerCase()} · {life.waterL.toFixed(1)}L ·{' '}
          {Math.round(life.kcal)} {t('julia.lifeToday.kcal')}
        </p>
      )}

      {!compact && (life.fiberG ?? 0) > 0 && (
        <p className="text-xs text-white/55 text-center">
          {t('julia.lifeToday.macroLine', {
            fat: Math.round(life.fatG ?? 0),
            carbs: Math.round(life.carbsG ?? 0),
            fiber: Math.round(life.fiberG ?? 0),
          })}
        </p>
      )}

      {life.microGaps && life.microGaps.length > 0 && (
        <LifeMicroGaps gaps={life.microGaps.slice(0, compact ? 2 : 3)} />
      )}

      <div className="flex items-center justify-between text-xs text-white/50 pt-1">
        <span className="inline-flex items-center gap-1">
          <OrbitIcon name="food" className="w-3.5 h-3.5 text-orbit-cyan/80" />
          {t('julia.lifeToday.nutritionAnchor', { pct: nutritionAnchor })}
        </span>
        {life.movementMin > 0 && (
          <span>{t('julia.lifeToday.movement', { min: life.movementMin })}</span>
        )}
      </div>

      {life.pantryAlerts.length > 0 && (
        <ul className="space-y-1.5 border-t border-white/10 pt-3">
          {life.pantryAlerts.slice(0, 3).map((alert) => (
            <li key={alert} className="flex gap-2 text-xs text-amber-200/90">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400/80" aria-hidden />
              {alert}
            </li>
          ))}
        </ul>
      )}

      <div className={`flex flex-wrap gap-2 ${compact ? 'pt-1' : 'pt-2'}`}>
        {links.notionLifeDay && (
          <a
            href={links.notionLifeDay}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-orbit-cyan hover:text-neon-green transition-colors"
          >
            Notion Life Day
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
        {links.todoistFood && (
          <a
            href={links.todoistFood}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-white/50 hover:text-neon-green transition-colors"
          >
            Todoist @eten
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
        {!compact && (
          <Link
            to="/cooking"
            className="inline-flex items-center gap-1 text-[11px] text-neon-green hover:text-neon-blue transition-colors"
          >
            {t('julia.planning.actions.openCooking')} →
          </Link>
        )}
      </div>
    </div>
  );
};
