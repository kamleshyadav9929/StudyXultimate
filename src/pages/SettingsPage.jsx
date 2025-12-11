import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DataManager } from '../services/DataManager';
import AIService from '../services/AIService';
import { Save, Download, Upload, RotateCcw, User, Moon, Sun, Monitor, Sparkles, Key, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

const SettingsPage = () => {
  const { state, updateState } = useApp();
  const [importError, setImportError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Load API key on mount
  useEffect(() => {
    setApiKey(localStorage.getItem('OPENROUTER_API_KEY') || '');
  }, []);

  const handleSaveApiKey = () => {
    AIService.setApiKey(apiKey);
    showSuccess('API key saved successfully!');
    setTestResult(null);
  };

  const handleRemoveApiKey = () => {
    setApiKey('');
    localStorage.removeItem('OPENROUTER_API_KEY');
    showSuccess('API key removed.');
    setTestResult(null);
  };

  const handleTestApiKey = async () => {
    if (!apiKey) return;
    setIsTesting(true);
    setTestResult(null);
    
    // Temporarily save the key for testing
    localStorage.setItem('OPENROUTER_API_KEY', apiKey);
    
    try {
      const response = await AIService.chat('Hello, please respond with "API working!" if you receive this.');
      if (response.isError) {
        setTestResult({ success: false, message: response.text });
      } else {
        setTestResult({ success: true, message: 'API key is valid and working!' });
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    }
    setIsTesting(false);
  };

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

          {/* AI Configuration */}
          <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Sparkles className="text-purple-400" />
              AI Configuration
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl border border-blue-500/20">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <Key size={16} className="text-blue-500" />
                      OpenRouter API Key
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Power up your AI with Gemini 2.0 Flash via OpenRouter.
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${apiKey ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    {apiKey ? '✓ Configured' : 'Not Set'}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type={isApiKeyVisible ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your OpenRouter API key..."
                      className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      {isApiKeyVisible ? '🙈' : '👁️'}
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveApiKey}
                      disabled={!apiKey}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <Save size={14} />
                      Save Key
                    </button>
                    <button
                      onClick={handleTestApiKey}
                      disabled={!apiKey || isTesting}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      {isTesting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          Test Key
                        </>
                      )}
                    </button>
                    {apiKey && (
                      <button
                        onClick={handleRemoveApiKey}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {testResult && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${testResult.success ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-400'}`}>
                      {testResult.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      <span className="text-sm">{testResult.message}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <a 
                    href="https://openrouter.ai/keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1"
                  >
                    <ExternalLink size={14} />
                    Get your API key from OpenRouter
                  </a>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">🤖 AI Features</h4>
                <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                  <li>• Answer any academic questions about your subjects</li>
                  <li>• Generate study notes and explanations</li>
                  <li>• Create practice quizzes for topics</li>
                  <li>• Provide personalized study tips based on your data</li>
                  <li>• Track attendance, tasks, and syllabus progress</li>
                </ul>
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
