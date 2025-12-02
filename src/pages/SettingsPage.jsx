import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DataManager } from '../services/DataManager';
import { Save, Download, Upload, RotateCcw, User, Moon, Sun, Monitor } from 'lucide-react';

const SettingsPage = () => {
  const { state, updateState } = useApp();
  const [importError, setImportError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studyx_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Data exported successfully!');
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        // Basic validation
        if (!importedData.dashboard || !importedData.subjects) {
          throw new Error('Invalid data format');
        }
        updateState(importedData);
        showSuccess('Data imported successfully!');
        setImportError(null);
      } catch (err) {
        setImportError('Failed to import data. Invalid JSON format.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      const defaultData = DataManager.resetData();
      updateState(defaultData);
      showSuccess('App reset to default state.');
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your data and preferences.</p>
      </header>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Data Management */}
        <div className="space-y-6">
          <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Save className="text-blue-400" />
              Data Management
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <h4 className="font-medium text-slate-900 dark:text-white mb-1">Export Data</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Download a backup of all your subjects, notes, and progress.</p>
                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Download size={16} />
                  Export JSON
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <h4 className="font-medium text-slate-900 dark:text-white mb-1">Import Data</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Restore your data from a backup file.</p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                    id="import-file"
                  />
                  <label 
                    htmlFor="import-file"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors text-sm font-medium cursor-pointer w-fit"
                  >
                    <Upload size={16} />
                    Select File
                  </label>
                </div>
                {importError && <p className="text-red-400 text-sm mt-2">{importError}</p>}
              </div>

              <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20">
                <h4 className="font-medium text-red-500 dark:text-red-400 mb-1">Danger Zone</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Reset all data to default factory settings.</p>
                <button 
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors text-sm font-medium"
                >
                  <RotateCcw size={16} />
                  Reset App
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Preferences */}
        <div className="space-y-6">
          <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="text-purple-400" />
              Profile & Appearance
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={state?.userProfile?.name || ""}
                  onChange={(e) => updateState({
                    ...state,
                    userProfile: { ...state.userProfile, name: e.target.value }
                  })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">University / College</label>
                <input 
                  type="text" 
                  value={state?.userProfile?.university || ""}
                  onChange={(e) => updateState({
                    ...state,
                    userProfile: { ...state.userProfile, university: e.target.value }
                  })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Semester</label>
                  <input 
                    type="text" 
                    value={state?.userProfile?.semester || ""}
                    onChange={(e) => updateState({
                      ...state,
                      userProfile: { ...state.userProfile, semester: e.target.value }
                    })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Goal</label>
                  <input 
                    type="text" 
                    value={state?.userProfile?.goal || ""}
                    onChange={(e) => updateState({
                      ...state,
                      userProfile: { ...state.userProfile, goal: e.target.value }
                    })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => updateState({ ...state, settings: { ...state.settings, theme: 'dark' } })}
                    className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all ${
                      state?.settings?.theme === 'dark' 
                        ? 'bg-blue-600/10 border-blue-500 text-blue-500' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Moon size={20} className="mb-2" />
                    <span className="text-xs font-medium">Dark</span>
                  </button>
                  <button 
                    onClick={() => updateState({ ...state, settings: { ...state.settings, theme: 'light' } })}
                    className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all ${
                      state?.settings?.theme === 'light' 
                        ? 'bg-blue-600/10 border-blue-500 text-blue-600' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Sun size={20} className="mb-2" />
                    <span className="text-xs font-medium">Light</span>
                  </button>
                  <button 
                    onClick={() => updateState({ ...state, settings: { ...state.settings, theme: 'system' } })}
                    className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all ${
                      state?.settings?.theme === 'system' 
                        ? 'bg-blue-600/10 border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Monitor size={20} className="mb-2" />
                    <span className="text-xs font-medium">System</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About</h3>
            <div className="text-slate-500 dark:text-slate-400 text-sm space-y-2">
              <p>StudyX Ultimate v1.0.0</p>
              <p>Built with React + Vite + TailwindCSS</p>
              <p className="pt-4 text-xs text-slate-400 dark:text-slate-600">
                Local storage usage: {((JSON.stringify(state).length / 1024).toFixed(2))} KB
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
