import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'development-notice-dismissed';

export const DevelopmentNoticePopup: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the popup before
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      // Small delay for better UX
      setTimeout(() => setIsOpen(true), 500);
    }
  }, []);

  const handleClose = (dontShowAgain: boolean = false) => {
    setIsOpen(false);
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            onClick={() => handleClose(false)}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-dark-secondary border border-neon-green/30 rounded-xl p-6 max-w-lg w-full shadow-2xl shadow-neon-green/20 relative">
              {/* Close Button */}
              <button
                onClick={() => handleClose(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-neon-green/20 border-2 border-neon-green/50 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-neon-green" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                {t('developmentNotice.title')}
              </h2>

              {/* Subtitle */}
              <p className="text-neon-green/80 text-sm text-center mb-6 font-medium">
                {t('developmentNotice.subtitle')}
              </p>

              {/* Message */}
              <p className="text-white/80 text-center mb-6 leading-relaxed">
                {t('developmentNotice.message')}
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleClose(false)}
                  className="flex-1 bg-gradient-to-r from-neon-green to-neon-blue text-dark-bg font-bold py-3 px-6 rounded-lg hover:shadow-lg hover:shadow-neon-green/30 transition-all duration-300"
                >
                  {t('developmentNotice.understand')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleClose(true)}
                  className="flex-1 bg-dark-bg/50 border border-white/20 text-white/80 font-medium py-3 px-6 rounded-lg hover:border-neon-green/50 hover:text-white transition-all duration-300"
                >
                  {t('developmentNotice.dontShowAgain')}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
