import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';
import { useLanguage } from '../context/LanguageContext';

const SplashScreen: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center"
      >
        <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
            <Logo className="h-24 w-24 mx-auto text-primary dark:text-secondary" />
        </motion.div>
        <h1 className="text-4xl font-bold text-primary dark:text-white mt-4">
          {t('appName')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{t('appSubtitle')}</p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
