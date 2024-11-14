import React, { useState, useRef, useEffect } from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitch() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLanguageSelect = (lang: 'en' | 'it') => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`px-4 py-2 rounded-lg text-sm font-medium
          transition-all duration-300 hover-lift border-glow
          flex items-center gap-2
          ${isOpen ? 'bg-gray-800 text-amber-500' : 'text-gray-300 hover:bg-gray-800'}`}
        aria-label={t('language')}
      >
        <Languages className="w-4 h-4" />
        <span className="hidden sm:inline">{t('language')}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-gray-800 border border-gray-700 
                      shadow-lg overflow-hidden animate-scale origin-top-right">
          <button
            onClick={() => handleLanguageSelect('en')}
            className={`w-full px-4 py-3 text-left text-sm transition-colors duration-200
              flex items-center gap-2
              ${language === 'en' ? 'bg-amber-500 text-gray-900' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            <span className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
              🇬🇧
            </span>
            {t('english')}
          </button>
          <button
            onClick={() => handleLanguageSelect('it')}
            className={`w-full px-4 py-3 text-left text-sm transition-colors duration-200
              flex items-center gap-2
              ${language === 'it' ? 'bg-amber-500 text-gray-900' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            <span className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
              🇮🇹
            </span>
            {t('italian')}
          </button>
        </div>
      )}
    </div>
  );
}