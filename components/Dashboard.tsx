import React from 'react';
import { Patient, SessionNote } from '../types';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface DashboardProps {
    patients: Patient[];
    onNavigate: () => void;
}

const StatCard: React.FC<{label: string; value: string | number; icon: React.ReactNode}> = ({ label, value, icon }) => (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-lg flex items-center gap-4">
        <div className="bg-secondary/20 text-secondary p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-3xl font-bold text-primary dark:text-white">{value}</p>
            <p className="text-gray-500 dark:text-gray-400">{label}</p>
        </div>
    </div>
);

const PatientsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.274-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.274.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>);
const ChartBarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>);
const DocumentTextIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);

const Dashboard: React.FC<DashboardProps> = ({ patients, onNavigate }) => {
    const { t } = useLanguage();

    const totalPatients = patients.length;
    const avgProgress = totalPatients > 0 ? Math.round(patients.reduce((acc, p) => acc + p.progress, 0) / totalPatients) : 0;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const sessionsThisWeek = patients.flatMap(p => p.sessionNotes).filter(note => new Date(note.date) >= oneWeekAgo).length;

    const recentNotes = patients
        .flatMap(patient => patient.sessionNotes.map(note => ({ ...note, patientName: patient.fullName })))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);


    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h1 className="text-3xl font-bold text-primary dark:text-white">{t('dashboard')}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('dashboardSubtitle')}</p>
            </motion.div>
            
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, staggerChildren: 0.1 }}
            >
                <motion.div variants={{hidden: {opacity: 0, y: 20}, visible: {opacity: 1, y: 0}}}>
                    <StatCard label={t('totalPatients')} value={totalPatients} icon={<PatientsIcon />} />
                </motion.div>
                 <motion.div variants={{hidden: {opacity: 0, y: 20}, visible: {opacity: 1, y: 0}}}>
                    <StatCard label={t('avgProgress')} value={`${avgProgress}%`} icon={<ChartBarIcon />} />
                </motion.div>
                <motion.div variants={{hidden: {opacity: 0, y: 20}, visible: {opacity: 1, y: 0}}}>
                    <StatCard label={t('sessionsThisWeek')} value={sessionsThisWeek} icon={<DocumentTextIcon />} />
                </motion.div>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div 
                    className="lg:col-span-3 bg-white dark:bg-dark-surface p-6 rounded-xl shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-primary dark:text-white">{t('recentActivity')}</h2>
                        <button onClick={onNavigate} className="font-semibold text-secondary hover:underline">{t('viewAllPatients')}</button>
                    </div>
                    <div className="space-y-4">
                        {recentNotes.length > 0 ? recentNotes.map(note => (
                            <div key={note.id} className="p-4 rounded-lg bg-light-bg dark:bg-dark-bg border-l-4 border-secondary dark:border-accent">
                                <p className="font-semibold">{note.patientName}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{note.text}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(note.date).toLocaleDateString()}</p>
                            </div>
                        )) : (
                            <p className="text-center py-8 text-gray-500 dark:text-gray-400">{t('noRecentActivity')}</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
