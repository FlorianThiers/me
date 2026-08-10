import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Package } from 'lucide-react';
import { useHomeStock } from '../hooks/useHomeStock';
import { OrbitBadge } from '../components/orbit/OrbitBadge';
import { StockSectionPanel, StockExpiringStrip } from '../components/orbit/StockSectionPanel';

export const StockPage: React.FC = () => {
  const { t } = useTranslation();
  const { snapshot, loading, error, isDemo, isLive } = useHomeStock();

  return (
    <div className="relative min-h-screen pb-16">
      <div className="container-custom px-4 py-8 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            to="/cooking"
            className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-orbit-cyan mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('stock.backCooking')}
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-6 h-6 text-orbit-cyan" />
                <OrbitBadge isLive={isLive} />
              </div>
              <h1 className="text-3xl font-bold text-white">{t('stock.title')}</h1>
              <p className="text-white/60 text-sm mt-2 max-w-xl">{t('stock.subtitle')}</p>
            </div>
            {snapshot?.stats && (
              <div className="text-right text-xs text-white/45 space-y-0.5">
                <p>{t('stock.stats.garden', { n: snapshot.stats.gardenReady })}</p>
                <p>{t('stock.stats.fridge', { n: snapshot.stats.fridgeFresh })}</p>
                <p>{t('stock.stats.freezer', { n: snapshot.stats.freezer })}</p>
              </div>
            )}
          </div>
          <p className="text-[11px] text-white/35 mt-4 border-l-2 border-orbit-violet/40 pl-3">
            {t('stock.priorityLegend')}
          </p>
          {snapshot && !isDemo && snapshot.stats && snapshot.stats.fridgeFresh === 0 && (
            <p className="text-xs text-orbit-cyan/80 mt-3 border-l-2 border-orbit-cyan/40 pl-3">
              {t('stock.returnHint')}
            </p>
          )}
        </motion.div>

        {loading && <p className="text-white/50 text-sm">{t('stock.loading')}</p>}
        {error && <p className="text-rose-300 text-sm">{t('stock.loadError')}</p>}
        {isDemo && snapshot && (
          <p className="text-xs text-amber-200/80 mb-4 border-l-2 border-amber-400/40 pl-3">
            {t('stock.demoNotice')}
          </p>
        )}

        {snapshot && (
          <div className="space-y-5">
            <StockExpiringStrip items={snapshot.expiringSoon} />
            {snapshot.sections.map((section, i) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <StockSectionPanel section={section} highlight={section.id === 'garden'} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
