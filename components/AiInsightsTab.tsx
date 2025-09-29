import React, { useState, useCallback } from 'react';
import { Patient, AIInsight } from '../types';
import { generateAnalysisAndStrategies } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';


interface AiInsightsTabProps {
  patient: Patient;
  onUpdatePatient: (patient: Patient) => void;
}

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1.586l.707-.707a1 1 0 011.414 1.414l-.707.707V7a1 1 0 01-2 0V5.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707V3a1 1 0 011-1zm0 14a1 1 0 011 1v1.586l.707-.707a1 1 0 111.414 1.414l-.707.707V19a1 1 0 11-2 0v-1.586l-.707.707a1 1 0 11-1.414-1.414l.707-.707V17a1 1 0 011-1zm10-14a1 1 0 011 1v1.586l.707-.707a1 1 0 111.414 1.414l-.707.707V7a1 1 0 11-2 0V5.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707V3a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);


const AiInsightsTab: React.FC<AiInsightsTabProps> = ({ patient, onUpdatePatient }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const { t, language } = useLanguage();
  const isOnline = useOnlineStatus();

  const handleGenerateInsights = useCallback(async () => {
    if (!isOnline) {
        setError(t('errorOffline'));
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateAnalysisAndStrategies(patient, language);
      setInsights(result);
    } catch (e) {
      setError(t('errorAIFailed'));
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [patient, isOnline, t, language]);

  const applySuggestedProgress = () => {
    if (insights) {
        onUpdatePatient({ ...patient, progress: insights.suggestedProgress });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="text-center">
        <button
          onClick={handleGenerateInsights}
          disabled={isLoading || !isOnline}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          title={!isOnline ? t('errorOffline') : ''}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t('analyzing')}</span>
            </>
          ) : (
            <>
              <SparklesIcon />
              <span>{t('generateAI')}</span>
            </>
          )}
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {!isOnline && !error && <p className="text-yellow-600 dark:text-yellow-400 mt-4">{t('errorOffline')}</p>}
      </div>
      
      <AnimatePresence>
      {insights && (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8 p-6 bg-light-bg dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-gray-700 space-y-6"
        >
          <div>
            <h3 className="text-xl font-semibold text-primary dark:text-secondary mb-2">{t('aiSummary')}</h3>
            <p className="text-gray-700 dark:text-gray-300 italic">{insights.analysisSummary}</p>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-white dark:bg-dark-surface rounded-lg flex-wrap">
            <p className="font-semibold">{t('aiSuggestedProgress')}:</p>
            <span className="text-2xl font-bold text-accent">{insights.suggestedProgress}%</span>
            <button onClick={applySuggestedProgress} className="ms-auto py-2 px-4 bg-secondary text-white text-sm font-semibold rounded-md hover:bg-opacity-80 transition-colors">{t('applyUpdate')}</button>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-primary dark:text-secondary mb-3">{t('recommendedStrategies')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.strategies.map((strategy, index) => (
                <div key={index} className="p-4 bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                  <h4 className="font-bold text-secondary">{strategy.title}</h4>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{strategy.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AiInsightsTab;