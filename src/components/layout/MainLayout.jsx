import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  ListTodo, 
  Clock, 
  FolderOpen, 
  CheckSquare, 
  GraduationCap, 
  Menu, 
  X,
  Settings,
  Link2,
  Flame,
  Trophy,
  Briefcase,
  BarChart2,
  Target,
  FileQuestion,
  Zap,
  Calendar,
  Timer
} from 'lucide-react';
import { clsx } from 'clsx';
import AIChatWidget from '../ai/AIChatWidget';

const SidebarItem = ({ to, icon: Icon, label, collapsed, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      clsx(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
        isActive 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
          : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
      )
    }
  >
    <Icon size={22} strokeWidth={1.5} />
    {!collapsed && <span className="font-medium">{label}</span>}
  </NavLink>
);

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/ai-assistant", icon: Zap, label: "StudyX AI" },
    { to: "/subjects", icon: BookOpen, label: "Subjects" },
    { to: "/schedule", icon: Timer, label: "Focus Timer" },
    { to: "/timetable", icon: Calendar, label: "Timetable" },
    { to: "/attendance", icon: CheckSquare, label: "Attendance" },
    { to: "/files", icon: FolderOpen, label: "File Organizer" },
    { to: "/grades", icon: Trophy, label: "Grades & Scores" },
    { to: "/tasks-deadlines", icon: Target, label: "Tasks & Deadlines" },
    { to: "/skills", icon: Zap, label: "Skill Tree" },
    { to: "/resources", icon: Link2, label: "Resources" },
    { to: "/habits", icon: Flame, label: "Habits" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-50 bg-white/80 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 backdrop-blur-xl transition-all duration-300 flex flex-col",
          collapsed ? "w-20" : "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-slate-800/50">
          <div className="flex items-center gap-3 text-blue-500">
            <img src="/logo.svg" alt="StudyX Logo" className="w-8 h-8 rounded-lg shadow-lg shadow-blue-500/20" />
            {!collapsed && <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">StudyX</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <SidebarItem 
              key={item.to} 
              {...item} 
              collapsed={collapsed} 
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </nav>

        {/* Footer / Toggle */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/50">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {collapsed ? <Menu size={20} /> : <span className="text-sm font-medium">Collapse Sidebar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="h-16 lg:hidden flex items-center px-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md">
          <button 
            onClick={() => setMobileOpen(true)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold text-lg">StudyX</span>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-2 md:p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
