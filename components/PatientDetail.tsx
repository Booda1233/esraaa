import React, { useState } from 'react';
import { Patient, SessionNote, Attachment } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressBar from './ProgressBar';
import AiInsightsTab from './AiInsightsTab';
import SessionForm from './SessionForm';
import PatientForm from './PatientForm';
import ConfirmationModal from './ConfirmationModal';
import AudioPlayer from './AudioPlayer';
import { useLanguage } from '../context/LanguageContext';

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  onUpdatePatient: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
}

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);
const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
);


const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);


const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onBack, onUpdatePatient, onDeletePatient }) => {
  const { t, language } = useLanguage();
  
  const tabs = [
    { id: 'details', label: t('tabDetails') },
    { id: 'notes', label: t('tabNotes') },
    { id: 'insights', label: t('tabInsights') },
  ];

  const [activeTab, setActiveTab] = useState('details');
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const handleAddSessionNote = (note: Omit<SessionNote, 'id' | 'author'>) => {
    const newNote: SessionNote = {
      ...note,
      id: `sn-${Date.now()}`,
      author: 'Dr.Esraa Safwat',
    };
    const updatedPatient = {
      ...patient,
      sessionNotes: [newNote, ...patient.sessionNotes],
    };
    onUpdatePatient(updatedPatient);
  };
  
  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl p-6 md:p-8 relative">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 rtl:right-6 rtl:left-auto flex items-center gap-2 text-primary dark:text-secondary font-semibold hover:underline z-10"
      >
        {language === 'ar' ? <ArrowRightIcon/> : <ArrowLeftIcon />}
        <span>{t('allPatients')}</span>
      </button>

      <div className="absolute top-6 right-6 rtl:left-6 rtl:right-auto flex gap-2 z-10">
          <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 py-2 px-4 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm font-semibold">
              <EditIcon /> {t('edit')}
          </button>
          <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-semibold">
              <TrashIcon /> {t('delete')}
          </button>
      </div>

      <div className="mt-16 md:mt-0 text-center">
        <motion.h2 layoutId={`patient-name-${patient.id}`} className="text-3xl font-bold text-primary dark:text-white">
          {patient.fullName}
        </motion.h2>
        <p className="text-gray-500 dark:text-gray-400 text-lg mt-1">{patient.diagnosis}</p>
      </div>

      <div className="my-8">
        <div className="flex justify-between items-center mb-2">
           <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('overallProgress')}</span>
           <span className="text-lg font-bold text-secondary">{patient.progress}%</span>
        </div>
        <ProgressBar progress={patient.progress} />
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6 rtl:space-x-reverse" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-secondary text-primary dark:text-secondary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-8 min-h-[300px]">
        {activeTab === 'details' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
              <div><strong>{t('age')}:</strong> {patient.age}</div>
              <div className="md:col-span-2"><strong>{t('caseHistory')}:</strong> <p className="mt-1 italic text-gray-600 dark:text-gray-400">{patient.caseHistory}</p></div>
              <div className="md:col-span-2"><strong>{t('treatmentPlan')}:</strong> <p className="mt-1 italic text-gray-600 dark:text-gray-400">{patient.treatmentPlan}</p></div>
              <div className="md:col-span-2"><strong>{t('additionalNotes')}:</strong> <p className="mt-1 italic text-gray-600 dark:text-gray-400">{patient.additionalNotes}</p></div>
            </div>
          </motion.div>
        )}
        {activeTab === 'notes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-xl font-semibold mb-4">{t('sessionTimeline')}</h3>
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 rtl:pr-0 rtl:pl-2">
              {patient.sessionNotes.length > 0 ? patient.sessionNotes.map(note => (
                <div key={note.id} className="p-4 rounded-lg bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-baseline">
                    <p className="font-bold text-secondary">{new Date(note.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{note.author}</p>
                  </div>
                  {note.text && <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.text}</p>}
                  {note.attachments && note.attachments.length > 0 && (
                    <div className="mt-4 border-t dark:border-gray-600 pt-3 space-y-2">
                      {note.attachments.map(att => (
                        <div key={att.id}>
                          {att.type === 'audio' && att.data ? (
                            <AudioPlayer src={att.data} />
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">{att.name}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t('noSessionNotes')}</p>
              )}
            </div>
          </motion.div>
        )}
        {activeTab === 'insights' && (
          <AiInsightsTab patient={patient} onUpdatePatient={onUpdatePatient} />
        )}
      </div>

      <button
        onClick={() => setIsSessionModalOpen(true)}
        className="fixed bottom-10 right-10 rtl:left-10 rtl:right-auto bg-secondary text-white p-4 rounded-full shadow-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-110 z-20"
        title={t('addNewSessionNote')}
      >
        <PlusIcon />
      </button>

      <AnimatePresence>
        {isSessionModalOpen && (
          <SessionForm
            onClose={() => setIsSessionModalOpen(false)}
            onSave={handleAddSessionNote}
          />
        )}
        {isEditModalOpen && (
          <PatientForm
            patient={patient}
            onClose={() => setIsEditModalOpen(false)}
            onSave={onUpdatePatient}
          />
        )}
        {isDeleteModalOpen && (
            <ConfirmationModal
                title={t('deletePatientTitle')}
                message={t('deletePatientMessage', { name: patient.fullName })}
                onConfirm={() => onDeletePatient(patient.id)}
                onCancel={() => setIsDeleteModalOpen(false)}
            />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientDetail;