import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CheckmatePopupProps {
  winner: 'white' | 'black';
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckmatePopup({ winner, isOpen, onClose }: CheckmatePopupProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`
        relative bg-gray-800 rounded-xl p-8 text-center
        transform transition-all duration-700 ease-out
        ${isAnimating ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
        border-2 border-amber-500 shadow-2xl
      `}>
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <div className={`
            relative w-24 h-24 bg-amber-500 rounded-full
            flex items-center justify-center
            transform transition-transform duration-700
            ${isAnimating ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}
          `}>
            <Trophy className="w-12 h-12 text-gray-900" />
            <div className="absolute inset-0 animate-ping bg-amber-500 rounded-full opacity-75" />
          </div>
        </div>
        
        <h2 className={`
          text-3xl font-bold text-amber-500 mb-4 mt-8
          transform transition-all duration-700 delay-300
          ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          {t('checkmate')}
        </h2>
        
        <p className={`
          text-xl text-gray-300
          transform transition-all duration-700 delay-500
          ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          {winner === 'white' ? t('whiteWins') : t('blackWins')}
        </p>
        
        <div className={`
          mt-8 space-y-4
          transform transition-all duration-700 delay-700
          ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-500 text-gray-900 rounded-lg
                     hover:bg-amber-600 transition-colors font-medium"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}