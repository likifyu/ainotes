import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import Toolbar from './components/Toolbar';
import AIChatPanel from './components/AIChatPanel';
import TranslationPanel from './components/TranslationPanel';
import AuthModal from './components/AuthModal';

const App: React.FC = () => {
  const {
    theme,
    setTheme,
    createNote,
    notes,
    isAuthenticated,
    setAuthModalOpen,
    isAuthModalOpen
  } = useStore();

  // Initialize theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
      setTheme(initialTheme);
    }
  }, [setTheme]);

  // Save theme preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  // Create initial note if none exist
  useEffect(() => {
    if (notes.length === 0) {
      createNote();
    }
  }, [notes.length, createNote]);

  // Show auth modal if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
    }
  }, [isAuthenticated, setAuthModalOpen]);

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Toolbar />
        <Editor />
      </div>
      <AIChatPanel />
      <TranslationPanel />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export default App;
