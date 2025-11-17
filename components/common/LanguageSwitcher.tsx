
import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center p-1 space-x-1 bg-gray-900/80 rounded-full border border-gray-700">
            <button
                onClick={() => setLanguage('es')}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${language === 'es' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
                ES
            </button>
            <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${language === 'en' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
                EN
            </button>
        </div>
    );
};

export default LanguageSwitcher;