import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import SubjectPage from './pages/SubjectPage';
import TimeManagementPage from './pages/TimeManagementPage';
import FileOrganizerPage from './pages/FileOrganizerPage';
import AttendancePage from './pages/AttendancePage';
import SubjectsPage from './pages/SubjectsPage';
import SyllabusPage from './pages/SyllabusPage';
import PYQPage from './pages/PYQPage';
import SettingsPage from './pages/SettingsPage';
import ResourcesPage from './pages/ResourcesPage';
import HabitTrackerPage from './pages/HabitTrackerPage';
import GradesPage from './pages/GradesPage';
import GoalsPage from './pages/GoalsPage';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="subjects" element={<SubjectsPage />} />
            <Route path="subject/:subjectCode" element={<SubjectPage />} />
            <Route path="syllabus" element={<SyllabusPage />} />
            <Route path="pyq" element={<PYQPage />} />
            <Route path="schedule" element={<TimeManagementPage />} />
            <Route path="files" element={<FileOrganizerPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="resources" element={<ResourcesPage />} />
            <Route path="habits" element={<HabitTrackerPage />} />
            <Route path="grades" element={<GradesPage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
