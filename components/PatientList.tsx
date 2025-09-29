import React, { useState } from 'react';
import { Patient } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import PatientCard from './PatientCard';
import PatientForm from './PatientForm';
import ConfirmationModal from './ConfirmationModal';
import { useLanguage } from '../context/LanguageContext';

interface PatientListProps {
  patients: Patient[];
  onSelectPatient: (id: string) => void;
  onAddPatient: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
  onBack: () => void;
}

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);
const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const PatientList: React.FC<PatientListProps> = ({ patients, onSelectPatient, onAddPatient, onDeletePatient, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const { t, language } = useLanguage();

  const filteredPatients = patients.filter(p =>
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const handleAddNewPatient = (patient: Patient) => {
    onAddPatient(patient);
    onSelectPatient(patient.id);
  }

  const handleDeleteRequest = (id: string) => {
    const patient = patients.find(p => p.id === id);
    if (patient) {
      setPatientToDelete(patient);
    }
  };

  const handleConfirmDelete = () => {
    if (patientToDelete) {
      onDeletePatient(patientToDelete.id);
      setPatientToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-primary dark:text-secondary font-semibold hover:underline">
          {language === 'ar' ? <ArrowRightIcon/> : <ArrowLeftIcon />}
          <span>{t('dashboard')}</span>
        </button>
        <div className="relative w-full max-w-md">
           <input
            type="text"
            placeholder={t('searchPatients')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 rounded-lg bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-secondary focus:outline-none"
            aria-label={t('searchPatients')}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto justify-center"
        >
          <PlusIcon />
          <span>{t('newPatient')}</span>
        </button>
      </div>

      {filteredPatients.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredPatients.map(patient => (
            <PatientCard 
              key={patient.id} 
              patient={patient} 
              onSelectPatient={onSelectPatient}
              onDeleteRequest={handleDeleteRequest}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
        >
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{t('noPatientsFound')}</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
                {searchQuery ? t('noPatientsMatch', { query: searchQuery }) : t('getStarted')}
            </p>
            {!searchQuery && (
                 <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-6 flex items-center gap-2 mx-auto bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
                >
                    <PlusIcon />
                    <span>{t('addNewPatient')}</span>
                </button>
            )}
        </motion.div>
      )}
      
      <AnimatePresence>
        {isModalOpen && (
          <PatientForm
            onClose={() => setIsModalOpen(false)}
            onSave={handleAddNewPatient}
          />
        )}
        {patientToDelete && (
          <ConfirmationModal
            title={t('deletePatientTitle')}
            message={t('deletePatientMessage', { name: patientToDelete.fullName })}
            onConfirm={handleConfirmDelete}
            onCancel={() => setPatientToDelete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientList;