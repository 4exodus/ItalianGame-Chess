import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sword, Brain, BookOpen } from 'lucide-react';
import LanguageSwitch from './LanguageSwitch';
import { useLanguage } from '../context/LanguageContext';

export default function Navigation() {
  const location = useLocation();
  const { t } = useLanguage();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-40">
      <div className="glass-effect border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link 
              to="/" 
              className="flex items-center gap-3 group hover-lift"
            >
              <Sword className="h-8 w-8 text-amber-500 transform transition-all duration-300 group-hover:rotate-12" />
              <span className="text-xl font-bold text-amber-500 text-shadow">
                Italian Game - Chess
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link
                to="/trainer"
                className={`px-4 py-2 rounded-lg text-sm font-medium
                  transition-all duration-300 hover-lift border-glow
                  flex items-center gap-2
                  ${location.pathname === '/trainer' 
                    ? 'bg-amber-500 text-gray-900' 
                    : 'text-gray-300 hover:bg-gray-800'}`}
              >
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">{t('trainer')}</span>
              </Link>
              <Link
                to="/story"
                className={`px-4 py-2 rounded-lg text-sm font-medium
                  transition-all duration-300 hover-lift border-glow
                  flex items-center gap-2
                  ${location.pathname === '/story' 
                    ? 'bg-amber-500 text-gray-900' 
                    : 'text-gray-300 hover:bg-gray-800'}`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">{t('story')}</span>
              </Link>
              <LanguageSwitch />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}