import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface ConfirmationModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const Backdrop = ({ children, onClick }: { children: React.ReactNode; onClick: () => void; }) => (
    <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
        {children}
    </motion.div>
);

const modalVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.2 } },
    exit: { scale: 0.9, opacity: 0, transition: { duration: 0.2 } }
};


const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ title, message, onConfirm, onCancel }) => {
    const { t } = useLanguage();
    return (
        <Backdrop onClick={onCancel}>
            <motion.div
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-md p-6"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <h3 className="text-xl font-bold text-primary dark:text-white">{title}</h3>
                <p className="my-4 text-gray-600 dark:text-gray-300">{message}</p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onCancel}
                        className="py-2 px-4 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-semibold"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-semibold"
                    >
                        {t('confirm')}
                    </button>
                </div>
            </motion.div>
        </Backdrop>
    );
};

export default ConfirmationModal;
