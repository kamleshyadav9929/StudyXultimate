import initialData from '../data/initialData.json';

const STORAGE_KEY = 'study_app_data_v2'; // Bumped version to force reset

export const DataManager = {
  /**
   * Initialize data in localStorage if not present or if version changed
   */
  init: () => {
    const existingData = localStorage.getItem(STORAGE_KEY);
    if (!existingData) {
      // Clear old version if exists
      localStorage.removeItem('study_app_data_v1');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    }
  },

  /**
   * Get the full application state
   */
  getData: () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : initialData;
  },

  /**
   * Save the full application state
   */
  saveData: (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  /**
   * Reset data to default
   */
  resetData: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }
};
