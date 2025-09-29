import React, { useState, useEffect } from 'react';
import { Patient } from './types';
import PatientList from './components/PatientList';
import PatientDetail from './components/PatientDetail';
import SplashScreen from './components/SplashScreen';
import Logo from './components/Logo';
import Dashboard from './components/Dashboard';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from './context/LanguageContext';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a5 5 0 100-10 5 5 0 000 10z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const LanguageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m4 13-4-4m0 0-4 4m4-4v12" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


// MOCK DATA
const initialPatients: Patient[] = [
  {
    id: '1',
    fullName: 'Alex Chen',
    age: 8,
    diagnosis: 'Autism Spectrum Disorder (ASD)',
    caseHistory: 'Diagnosed at age 4. Shows strong interest in patterns and numbers but has difficulty with social cues and unstructured playtime.',
    treatmentPlan: 'Applied Behavior Analysis (ABA) therapy twice a week, focusing on social skills and communication. Occupational therapy for sensory integration.',
    additionalNotes: 'Responds well to visual aids and structured routines.',
    progress: 65,
    sessionNotes: [
      { id: 's1-1', date: '2023-10-26', text: 'Alex successfully participated in a turn-taking game with minimal prompting. Showed increased eye contact.', author: 'Dr.Esraa Safwat', attachments: [] },
      { id: 's1-2', date: '2023-10-24', text: 'Session focused on identifying emotions from pictures. Alex correctly identified "happy" and "sad" but struggled with "surprised".', author: 'Dr.Esraa Safwat', attachments: [] },
    ],
  },
  {
    id: '2',
    fullName: 'Mia Rodriguez',
    age: 6,
    diagnosis: 'Developmental Delay',
    caseHistory: 'Exhibits delays in speech and fine motor skills. Parents report frustration during communication attempts.',
    treatmentPlan: 'Speech therapy to improve articulation and vocabulary. Play-based therapy to develop motor skills and social interaction.',
    additionalNotes: 'Loves music and responds positively to songs used in therapy.',
    progress: 40,
    sessionNotes: [
      { id: 's2-1', date: '2023-10-25', text: 'Mia used a 3-word sentence today unprompted ("I want juice"). This is a significant milestone. Motor skills practice with building blocks was challenging.', author: 'Dr.Esraa Safwat', attachments: [] },
    ],
  },
];


const App: React.FC = () => {
  type View = 'dashboard' | 'list' | 'detail';

  const { language, setLanguage, t } = useLanguage();

  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const localData = localStorage.getItem('neurocare_patients');
      if (localData) {
        return JSON.parse(localData);
      }
      // Set initial data only if nothing is in localStorage
      localStorage.setItem('neurocare_patients', JSON.stringify(initialPatients));
      return initialPatients;
    } catch (error) {
      console.error("Could not parse patients from localStorage", error);
      return initialPatients;
    }
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const savePatientsToStorage = (newPatients: Patient[]): boolean => {
    try {
      localStorage.setItem('neurocare_patients', JSON.stringify(newPatients));
      return true;
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.code === 22)) {
           alert(t('errorStorageFull'));
      } else {
           alert(t('errorStorageGeneric'));
      }
      return false;
    }
  };
  
  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    setCurrentView('detail');
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    const newPatients = patients.map(p => p.id === updatedPatient.id ? updatedPatient : p);
    if (savePatientsToStorage(newPatients)) {
      setPatients(newPatients);
    }
  };
  
  const handleAddPatient = (newPatient: Patient) => {
    const newPatients = [...patients, newPatient];
    if (savePatientsToStorage(newPatients)) {
      setPatients(newPatients);
    }
  };

  const handleDeletePatient = (id: string) => {
    const newPatients = patients.filter(p => p.id !== id);
    if (savePatientsToStorage(newPatients)) {
      setPatients(newPatients);
      if (selectedPatientId === id) {
        setSelectedPatientId(null);
        setCurrentView('list');
      }
    }
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  if (isLoading) {
    return <SplashScreen />;
  }

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };
  
  const getAnimationProps = (view: View) => {
      const isRTL = language === 'ar';
      const initialX = {
          dashboard: isRTL ? -300 : 300,
          list: isRTL ? -300 : 300,
          detail: isRTL ? -300 : 300
      };
      const exitX = {
          dashboard: isRTL ? 300 : -300,
          list: isRTL ? 300 : -300,
          detail: isRTL ? 300 : -300
      };

      return {
          key: view,
          initial: { opacity: 0, x: initialX[view] },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: exitX[view] },
          transition: { duration: 0.3 }
      }
  };

  return (
    <div className="bg-light-bg dark:bg-dark-bg min-h-screen text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
      <header className="bg-primary text-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-secondary" />
          <h1 className="text-2xl font-bold">{t('appName')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleLanguage} className="p-2 rounded-full hover:bg-white/20 transition-colors flex items-center gap-1">
            <LanguageIcon />
            <span className="font-semibold text-sm">{language === 'en' ? 'AR' : 'EN'}</span>
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-white/20 transition-colors">
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div {...getAnimationProps('dashboard')}>
              <Dashboard patients={patients} onNavigate={() => setCurrentView('list')} />
            </motion.div>
          )}

          {currentView === 'list' && (
             <motion.div {...getAnimationProps('list')}>
                <PatientList 
                  patients={patients} 
                  onSelectPatient={handleSelectPatient}
                  onAddPatient={handleAddPatient} 
                  onDeletePatient={handleDeletePatient}
                  onBack={() => setCurrentView('dashboard')}
                />
             </motion.div>
          )}
          
          {currentView === 'detail' && selectedPatient && (
             <motion.div {...getAnimationProps('detail')}>
                <PatientDetail 
                  patient={selectedPatient} 
                  onBack={() => setCurrentView('list')}
                  onUpdatePatient={handleUpdatePatient}
                  onDeletePatient={handleDeletePatient}
                />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;