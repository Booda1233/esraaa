import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const normalizedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
      <motion.div
        className="bg-gradient-to-r from-secondary to-accent h-3 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${normalizedProgress}%` }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
      </motion.div>
    </div>
  );
};

export default ProgressBar;
