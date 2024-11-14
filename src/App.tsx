import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './components/Home';
import ChessTrainer from './components/ChessTrainer';
import ChessStory from './components/ChessStory';
import { ChessProvider } from './context/ChessContext';
import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <ChessProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-900 text-gray-100">
            <Navigation />
            <main className="container mx-auto px-4 py-8 pt-24">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/trainer" element={<ChessTrainer />} />
                <Route path="/story" element={<ChessStory />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </ChessProvider>
    </LanguageProvider>
  );
}