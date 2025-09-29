import React, { useState } from 'react';
import { Patient } from '../types';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface PatientFormProps {
  patient?: Patient;
  onClose: () => void;
  onSave: (patient: Patient) => void;
}

const Backdrop = ({ children, onClick }: { children: React.ReactNode; onClick: () => void; }) => (
    <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
        onClick={onClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
        {children}
    </motion.div>
);

const modalVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 20 } },
    exit: { y: 50, opacity: 0 }
} as const;

type FormData = {
    fullName: string;
    age: string;
    diagnosis: string;
    caseHistory: string;
    treatmentPlan: string;
    additionalNotes: string;
};

// Moved helper components outside of PatientForm to prevent them from being
// re-created on every render, which caused input fields to lose focus on mobile.
const InputField: React.FC<{
  label: string;
  name: keyof FormData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}> = ({ label, name, value, onChange, type = 'text', required = true }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input type={type} name={name} id={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-bg shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
    </div>
);

const TextareaField: React.FC<{
  label: string;
  name: keyof FormData;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  required?: boolean;
}> = ({ label, name, value, onChange, rows = 3, required = true }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <textarea name={name} id={name} value={value} onChange={onChange} rows={rows} required={required} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-bg shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
    </div>
);


const PatientForm: React.FC<PatientFormProps> = ({ patient, onClose, onSave }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    fullName: patient?.fullName || '',
    age: String(patient?.age || ''),
    diagnosis: patient?.diagnosis || '',
    caseHistory: patient?.caseHistory || '',
    treatmentPlan: patient?.treatmentPlan || '',
    additionalNotes: patient?.additionalNotes || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient: Patient = {
      id: patient?.id || `p-${Date.now()}`,
      fullName: formData.fullName,
      age: parseInt(formData.age) || 0,
      diagnosis: formData.diagnosis,
      caseHistory: formData.caseHistory,
      treatmentPlan: formData.treatmentPlan,
      additionalNotes: formData.additionalNotes,
      progress: patient?.progress || 0,
      sessionNotes: patient?.sessionNotes || []
    };
    onSave(newPatient);
    onClose();
  };
  
  return (
    <Backdrop onClick={onClose}>
      <motion.div
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
      >
        <h2 className="text-2xl font-bold text-primary dark:text-white mb-6">{patient ? t('editPatient') : t('addNewPatient')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label={t('fullName')} name="fullName" value={formData.fullName} onChange={handleChange} />
          <InputField label={t('age')} name="age" type="number" value={formData.age} onChange={handleChange} />
          <InputField label={t('diagnosis')} name="diagnosis" value={formData.diagnosis} onChange={handleChange} />
          <TextareaField label={t('caseHistory')} name="caseHistory" rows={4} value={formData.caseHistory} onChange={handleChange} />
          <TextareaField label={t('treatmentPlan')} name="treatmentPlan" rows={4} value={formData.treatmentPlan} onChange={handleChange}/>
          <TextareaField label={t('additionalNotes')} name="additionalNotes" required={false} value={formData.additionalNotes} onChange={handleChange} />
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">{t('cancel')}</button>
            <button type="submit" className="py-2 px-4 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors">{t('savePatient')}</button>
          </div>
        </form>
      </motion.div>
    </Backdrop>
  );
};

export default PatientForm;