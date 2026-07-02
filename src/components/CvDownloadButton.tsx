import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileDown } from 'lucide-react';
import { CV } from '../config/contact';

type Variant = 'primary' | 'outline' | 'compact';

interface CvDownloadButtonProps {
  variant?: Variant;
  className?: string;
}

export const CvDownloadButton: React.FC<CvDownloadButtonProps> = ({
  variant = 'outline',
  className = '',
}) => {
  const { t } = useTranslation();

  const base =
    variant === 'compact'
      ? 'inline-flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-300'
      : 'inline-flex items-center justify-center gap-2 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300';

  const styles =
    variant === 'primary'
      ? 'bg-gradient-to-r from-neon-green to-neon-blue text-dark-bg hover:shadow-2xl hover:shadow-neon-green/30'
      : variant === 'outline'
        ? 'border-2 border-neon-green/60 text-neon-green hover:bg-neon-green/10 hover:border-neon-green'
        : 'text-neon-green hover:text-white border border-neon-green/30 hover:border-neon-green/60 bg-dark-secondary/50';

  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className={className}>
      <Link
        to={CV.route}
        className={`${base} ${styles}`}
        aria-label={t('cv.viewOrDownload')}
      >
        <FileDown size={variant === 'compact' ? 16 : 20} aria-hidden="true" />
        <span>{t('cv.download')}</span>
      </Link>
    </motion.div>
  );
};
