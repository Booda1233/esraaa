import React, { useState, useRef } from 'react';
import { SessionNote, Attachment } from '../types';
import { motion } from 'framer-motion';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import AudioPlayer from './AudioPlayer';
import { useLanguage } from '../context/LanguageContext';

interface SessionFormProps {
  onClose: () => void;
  onSave: (note: Omit<SessionNote, 'id' | 'author'>) => void;
}

const MicIcon: React.FC<{isListening: boolean}> = ({ isListening }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 transition-colors ${isListening ? 'text-red-500' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

const PaperclipIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
);

const DocumentTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);


const Backdrop = ({ children, onClick }: { children: React.ReactNode; onClick: () => void; }) => (
    <motion.div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center" onClick={onClick} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        {children}
    </motion.div>
);

const modalVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 }
};

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
  });
};


const SessionForm: React.FC<SessionFormProps> = ({ onClose, onSave }) => {
  const [text, setText] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
  } = useAudioRecorder();

  const handleStopRecording = async () => {
      const audio = await stopRecording();
      if (audio) {
          const newAttachment: Attachment = {
              id: `audio-${Date.now()}`,
              name: `${t('audioNote')} - ${new Date().toLocaleDateString()}`,
              type: audio.audioBlob.type || 'audio/webm',
              data: audio.audioUrl
          };
          setAttachments(prev => [...prev, newAttachment]);
      }
  };
  
  const handleMicClick = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      startRecording();
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const base64Data = await blobToBase64(file);
      const newAttachment: Attachment = {
        id: `file-${Date.now()}`,
        name: file.name,
        type: file.type,
        data: base64Data
      };
      setAttachments(prev => [...prev, newAttachment]);
    }
  };
  
  const triggerFileInput = () => {
      fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && attachments.length === 0) return;
    onSave({ date, text, attachments });
    onClose();
  };

  const removeAttachment = (id: string) => {
      setAttachments(prev => prev.filter(att => att.id !== id));
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
        <h2 className="text-2xl font-bold text-primary dark:text-white mb-6">{t('newSessionNote')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('date')}</label>
            <input type="date" name="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-bg shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" />
          </div>
          
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('notes')}</label>
            <textarea name="text" id="text" value={text} onChange={(e) => setText(e.target.value)} rows={5} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-bg shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm p-2" placeholder={t('notesPlaceholder')}></textarea>
          </div>
          
          <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('attachments')}</label>
              <div className="space-y-3">
                  {attachments.map((att) => (
                      <div key={att.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                         {att.type.startsWith('audio/') && att.data ? (
                           <AudioPlayer src={att.data} />
                         ) : (
                           <div className="flex items-center gap-2 overflow-hidden">
                             <DocumentTextIcon />
                             <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{att.name}</span>
                           </div>
                         )}
                         <button type="button" onClick={() => removeAttachment(att.id)} className="p-1 text-red-500 hover:text-red-700 flex-shrink-0">
                           <TrashIcon />
                         </button>
                      </div>
                  ))}
              </div>
          </div>
          
          <div className="pt-2">
            <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                    <button 
                        type="button" 
                        onClick={handleMicClick}
                        className={`p-4 rounded-full transition-all duration-200 ${isRecording ? 'bg-red-100 dark:bg-red-900/50 scale-110' : 'bg-gray-200 dark:bg-gray-600'}`}
                    >
                        <MicIcon isListening={isRecording} />
                    </button>
                    {isRecording ? (
                         <div className="flex items-center gap-2 mt-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="font-mono text-lg text-red-500">{formatTime(recordingTime)}</span>
                        </div>
                    ) : (
                         <p className="text-xs text-gray-500 mt-2">{t('tapToRecord')}</p>
                    )}
                </div>
                <div className="text-center">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button type="button" onClick={triggerFileInput} className="p-4 rounded-full bg-gray-200 dark:bg-gray-600">
                        <PaperclipIcon />
                    </button>
                    <p className="text-xs text-gray-500 mt-2">{t('attachFile')}</p>
                </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">{t('cancel')}</button>
            <button type="submit" className="py-2 px-4 bg-secondary text-white rounded-md hover:bg-opacity-90 transition-colors">{t('saveNote')}</button>
          </div>
        </form>
      </motion.div>
    </Backdrop>
  );
};

export default SessionForm;