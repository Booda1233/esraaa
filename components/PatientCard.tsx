import React from 'react';
import { Patient } from '../types';
import { motion, useMotionValue, PanInfo } from 'framer-motion';
import ProgressBar from './ProgressBar';
import { useLanguage } from '../context/LanguageContext';

interface PatientCardProps {
  patient: Patient;
  onSelectPatient: (id: string) => void;
  onDeleteRequest: (id: string) => void;
}

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const PatientCard: React.FC<PatientCardProps> = ({ patient, onSelectPatient, onDeleteRequest }) => {
  const x = useMotionValue(0);
  const { language } = useLanguage();

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = language === 'en' ? -100 : 100;
    const isPastThreshold = language === 'en' ? info.offset.x < threshold : info.offset.x > threshold;

    if (isPastThreshold) {
      onDeleteRequest(patient.id);
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      layout
    >
      <motion.div
        className="bg-white dark:bg-dark-surface rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
        onClick={() => {
          if (Math.abs(x.get()) < 5) { // Only select if not dragged
            onSelectPatient(patient.id);
          }
        }}
        drag="x"
        dragConstraints={language === 'en' ? { left: 0, right: 0 } : { left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        style={{ x }}
        dragElastic={{ left: 0.5, right: 0.5 }}
      >
        <div className="p-6">
          <motion.h3 
            className="text-xl font-bold text-primary dark:text-gray-100"
            layoutId={`patient-name-${patient.id}`}
          >
            {patient.fullName}
          </motion.h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{patient.diagnosis}</p>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Progress</p>
            <ProgressBar progress={patient.progress} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PatientCard;
