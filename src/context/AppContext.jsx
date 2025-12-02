import React, { createContext, useContext, useState, useEffect } from 'react';
import { DataManager } from '../services/DataManager';

import initialData from '../data/initialData.json';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize and load data
    DataManager.init();
    const loadedData = DataManager.getData();
    
    // Merge with initialData to ensure new keys (resources, habits) exist
    // This handles the case where localStorage has old data structure
    const mergedData = { ...initialData, ...loadedData };
    
    // Specifically ensure resources and habits objects exist if they are missing
    // Specifically ensure resources and habits objects exist if they are missing
    if (!mergedData.resources) mergedData.resources = initialData.resources;
    if (!mergedData.habits) mergedData.habits = initialData.habits;
    if (!mergedData.userProfile.goal) mergedData.userProfile.goal = initialData.userProfile.goal;

    // Deep merge PYQs to ensure new questions appear while keeping status of old ones
    if (initialData.pyq) {
      mergedData.pyq = { ...initialData.pyq }; // Start with new structure
      
      // If we have saved PYQ data, merge statuses back in
      if (loadedData.pyq) {
        Object.keys(loadedData.pyq).forEach(subjectCode => {
          if (mergedData.pyq[subjectCode] && loadedData.pyq[subjectCode]) {
            // Create a map of saved questions for faster lookup
            const savedQuestionsMap = new Map(
              loadedData.pyq[subjectCode].map(q => [q.id, q])
            );

            // Update new questions with saved status if it exists
            mergedData.pyq[subjectCode] = mergedData.pyq[subjectCode].map(q => {
              const savedQ = savedQuestionsMap.get(q.id);
              return savedQ ? { ...q, status: savedQ.status } : q;
            });
          }
        });
      }
    }

    setState(mergedData);
    setLoading(false);
  }, []);

  // Theme Handling
  useEffect(() => {
    if (state?.settings?.theme) {
      const root = window.document.documentElement;
      
      const applyTheme = (theme) => {
        if (theme === 'dark') {
          root.classList.add('dark');
        } else if (theme === 'light') {
          root.classList.remove('dark');
        } else if (theme === 'system') {
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      };

      applyTheme(state.settings.theme);

      // Listener for system theme changes
      if (state.settings.theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => applyTheme('system');
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    }
  }, [state?.settings?.theme]);

  const updateState = (newData) => {
    setState(newData);
    DataManager.saveData(newData);
  };

  /**
   * Helper to update a specific section of the state
   * @param {string} section - e.g., 'dashboard', 'subjects'
   * @param {any} value - The new value for that section
   */
  const updateSection = (section, value) => {
    if (!state) return;
    const newState = { ...state, [section]: value };
    updateState(newState);
  };

  const value = {
    state,
    loading,
    updateState,
    updateSection
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
