import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FileText, Image, FileCode, Upload, Search, Trash2, Tag, 
  ExternalLink, File, X, Download, FolderPlus, ChevronRight, 
  MoreVertical, Grid, List as ListIcon, Edit2, HardDrive, FileArchive,
  Film, Music, FileSpreadsheet, Presentation
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { clsx } from 'clsx';
import CustomSelect from '../components/ui/CustomSelect';
import { saveFileToDB, deleteFileFromDB, getAllFilesFromDB } from '../utils/fileStorage';

const FileOrganizerPage = () => {
  const { state } = useApp();
  
  const [files, setFiles] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);

  const [selectedFileId, setSelectedFileId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileMeta, setFileMeta] = useState({ name: '', subject: '', tags: '' });
  const [newFolderName, setNewFolderName] = useState('');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadFiles();
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadFiles = async () => {
    try {
      const dbFiles = await getAllFilesFromDB();
      setFiles(dbFiles);
    } catch (error) {
      console.error("Failed to load files:", error);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const totalFiles = files.filter(f => f.type !== 'folder').length;
    const totalFolders = files.filter(f => f.type === 'folder').length;
    const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);
    const subjects = [...new Set(files.map(f => f.subject).filter(Boolean))].length;
    return { totalFiles, totalFolders, totalSize, subjects };
  }, [files]);

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Drag & Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleFileDragStart = (e, fileId) => {
    e.dataTransfer.setData("fileId", fileId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleFolderDrop = async (e, folderId) => {
    e.preventDefault();
    e.stopPropagation();
    const fileId = e.dataTransfer.getData("fileId");
    if (!fileId) return;

    const fileToMove = files.find(f => f.id === fileId);
    if (fileToMove && fileToMove.id !== folderId) {
      const updatedFile = { ...fileToMove, parentId: folderId };
      await saveFileToDB(updatedFile);
      loadFiles();
    }
    e.currentTarget.classList.remove('ring-2', 'ring-blue-500');
  };

  const handleFolderDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    e.currentTarget.classList.add('ring-2', 'ring-blue-500');
  };

  const handleFolderDragLeave = (e) => {
    e.currentTarget.classList.remove('ring-2', 'ring-blue-500');
  };

  // File Actions
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setFileMeta({ name: file.name, subject: '', tags: '' });
    setIsUploading(true);
  };

  const handleSaveFile = async () => {
    if (!selectedFile || !fileMeta.name || !fileMeta.subject) return;

    setUploadProgress(10);
    const reader = new FileReader();
    reader.onload = async () => {
      setUploadProgress(50);
      const fileData = {
        id: uuidv4(),
        name: fileMeta.name,
        originalName: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        subject: fileMeta.subject,
        tags: fileMeta.tags.split(',').map(t => t.trim()).filter(t => t),
        date: new Date().toISOString().split('T')[0],
        parentId: currentFolder,
        content: selectedFile 
      };

      try {
        await saveFileToDB(fileData);
        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setSelectedFile(null);
          setFileMeta({ name: '', subject: '', tags: '' });
          setUploadProgress(0);
          loadFiles();
        }, 500);
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadProgress(0);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const folderData = {
      id: uuidv4(),
      name: newFolderName,
      type: 'folder',
      parentId: currentFolder,
      date: new Date().toISOString().split('T')[0],
      subject: 'Folder',
      tags: []
    };
    await saveFileToDB(folderData);
    setNewFolderName('');
    setIsCreatingFolder(false);
    loadFiles();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this item?")) {
      await deleteFileFromDB(id);
      loadFiles();
    }
  };

  const handleRename = async () => {
    if (!renamingId || !renameValue.trim()) return;
    const file = files.find(f => f.id === renamingId);
    if (file) {
      await saveFileToDB({ ...file, name: renameValue });
      loadFiles();
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const handleItemClick = (e, id) => {
    e.stopPropagation();
    setSelectedFileId(id);
    setContextMenu(null);
  };

  const handleItemDoubleClick = (file) => {
    if (file.type === 'folder') {
      setCurrentFolder(file.id);
      setFolderPath([...folderPath, { id: file.id, name: file.name }]);
      setSelectedFileId(null);
    } else {
      const blob = file.content;
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  const handleContextMenu = (e, fileId) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFileId(fileId);
    setContextMenu({ x: e.clientX, y: e.clientY, fileId });
  };

  const navigateToBreadcrumb = (index) => {
    if (index === -1) {
      setFolderPath([]);
      setCurrentFolder(null);
    } else {
      const newPath = folderPath.slice(0, index + 1);
      setFolderPath(newPath);
      setCurrentFolder(newPath[newPath.length - 1].id);
    }
    setSelectedFileId(null);
  };

  const getFileIcon = (mimeType, size = 24) => {
    if (mimeType === 'folder') return <Folder className="text-blue-500" size={size} />;
    if (mimeType?.startsWith('image/')) return <Image className="text-purple-500" size={size} />;
    if (mimeType?.includes('pdf')) return <FileText className="text-red-500" size={size} />;
    if (mimeType?.includes('video')) return <Film className="text-pink-500" size={size} />;
    if (mimeType?.includes('audio')) return <Music className="text-green-500" size={size} />;
    if (mimeType?.includes('zip') || mimeType?.includes('rar')) return <FileArchive className="text-amber-500" size={size} />;
    if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) return <FileSpreadsheet className="text-emerald-500" size={size} />;
    if (mimeType?.includes('presentation') || mimeType?.includes('powerpoint')) return <Presentation className="text-orange-500" size={size} />;
    if (mimeType?.includes('code') || mimeType?.includes('javascript') || mimeType?.includes('html')) return <FileCode className="text-cyan-500" size={size} />;
    return <File className="text-slate-400" size={size} />;
  };

  const subjectOptions = Object.keys(state.subjects).map(s => ({ value: s, label: state.subjects[s].name || s }));

  const filteredItems = files.filter(file => {
    if ((file.parentId || null) !== currentFolder) return false;
    const matchesSubject = selectedSubject === 'All' || file.subject === selectedSubject || file.type === 'folder';
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (file.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesSubject && matchesSearch;
  }).sort((a, b) => {
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;
    return a.name.localeCompare(b.name);
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-8"
      onDragEnter={handleDrag}
      onClick={() => { setSelectedFileId(null); setContextMenu(null); setRenamingId(null); }}
    >
      {/* Hero Header */}
      <motion.header 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur-3xl opacity-20 animate-float" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl opacity-15 animate-float-delayed" />
        </div>

        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-4"
          >
            <HardDrive size={14} className="text-white/70" />
            <span className="text-xs font-medium text-white/70 uppercase tracking-wider">File Manager</span>
          </motion.div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                File{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Organizer
                </span>
              </h1>
              <p className="text-slate-400 text-sm md:text-base">
                Securely store and manage all your study resources.
              </p>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { e.stopPropagation(); setIsCreatingFolder(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all border border-white/10"
              >
                <FolderPlus size={18} />
                New Folder
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { e.stopPropagation(); setIsUploading(true); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-xl font-bold shadow-lg transition-all"
              >
                <Upload size={18} />
                Upload
              </motion.button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Files', value: stats.totalFiles, icon: File, color: '#3b82f6' },
              { label: 'Folders', value: stats.totalFolders, icon: Folder, color: '#8b5cf6' },
              { label: 'Storage', value: formatSize(stats.totalSize), icon: HardDrive, color: '#10b981' },
              { label: 'Subjects', value: stats.subjects, icon: Tag, color: '#f59e0b' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${stat.color}20` }}>
                    <stat.icon size={14} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Toolbar */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-3" onClick={(e) => e.stopPropagation()}>
        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {/* Subject Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['All', ...Object.keys(state.subjects)].map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={clsx(
                "px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all",
                selectedSubject === sub 
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg" 
                  : "bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800"
              )}
            >
              {sub === 'All' ? 'All Files' : state.subjects[sub]?.shortName || sub}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
          <button 
            onClick={() => setViewMode('grid')}
            className={clsx("p-2.5 rounded-lg transition-all", viewMode === 'grid' ? "bg-slate-100 dark:bg-slate-800 text-blue-600" : "text-slate-400")}
          >
            <Grid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={clsx("p-2.5 rounded-lg transition-all", viewMode === 'list' ? "bg-slate-100 dark:bg-slate-800 text-blue-600" : "text-slate-400")}
          >
            <ListIcon size={18} />
          </button>
        </div>
      </motion.div>

      {/* Breadcrumbs */}
      <motion.div 
        variants={itemVariants} 
        className="flex items-center gap-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-xl overflow-x-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => navigateToBreadcrumb(-1)}
          className={clsx("hover:text-blue-500 font-medium transition-colors flex items-center gap-1", !currentFolder && "text-slate-900 dark:text-white")}
        >
          <Folder size={16} /> Home
        </button>
        {folderPath.map((folder, index) => (
          <React.Fragment key={folder.id}>
            <ChevronRight size={16} className="text-slate-400" />
            <button 
              onClick={() => navigateToBreadcrumb(index)}
              className={clsx("hover:text-blue-500 font-medium transition-colors", index === folderPath.length - 1 && "text-slate-900 dark:text-white")}
            >
              {folder.name}
            </button>
          </React.Fragment>
        ))}
      </motion.div>

      {/* Drag Overlay */}
      <AnimatePresence>
        {dragActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-blue-500/10 backdrop-blur-sm border-4 border-blue-500 border-dashed m-4 rounded-3xl flex items-center justify-center pointer-events-none"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-center"
            >
              <Upload size={64} className="text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-blue-700">Drop files here</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Grid/List View */}
      <motion.div variants={itemVariants}>
        {filteredItems.length > 0 ? (
          viewMode === 'grid' ? (
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {filteredItems.map((file, idx) => (
                <motion.div 
                  key={file.id}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  draggable={file.type !== 'folder' && renamingId !== file.id}
                  onDragStart={(e) => handleFileDragStart(e, file.id)}
                  onDrop={(e) => file.type === 'folder' && handleFolderDrop(e, file.id)}
                  onDragOver={(e) => file.type === 'folder' && handleFolderDragOver(e)}
                  onDragLeave={(e) => file.type === 'folder' && handleFolderDragLeave(e)}
                  onClick={(e) => handleItemClick(e, file.id)}
                  onDoubleClick={() => handleItemDoubleClick(file)}
                  onContextMenu={(e) => handleContextMenu(e, file.id)}
                  className={clsx(
                    "group relative p-5 rounded-2xl border transition-all cursor-pointer",
                    selectedFileId === file.id 
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-lg" 
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 hover:shadow-lg"
                  )}
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className={clsx(
                        "p-4 rounded-2xl transition-all",
                        file.type === 'folder' ? "bg-blue-100 dark:bg-blue-900/30" : "bg-slate-100 dark:bg-slate-800"
                      )}
                    >
                      {getFileIcon(file.type, 32)}
                    </motion.div>
                    
                    <div className="w-full">
                      {renamingId === file.id ? (
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename();
                            if (e.key === 'Escape') setRenamingId(null);
                          }}
                          onBlur={handleRename}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          className="w-full text-center text-sm font-medium bg-white dark:bg-slate-800 border-2 border-blue-500 rounded-lg px-2 py-1 focus:outline-none"
                        />
                      ) : (
                        <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm" title={file.name}>
                          {file.name}
                        </h3>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        {file.type === 'folder' ? 'Folder' : formatSize(file.size)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4 w-32">Date</th>
                    <th className="px-5 py-4 w-24">Size</th>
                    <th className="px-5 py-4 w-32">Subject</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredItems.map((file) => (
                    <motion.tr 
                      key={file.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                      draggable={file.type !== 'folder'}
                      onDragStart={(e) => handleFileDragStart(e, file.id)}
                      onDrop={(e) => file.type === 'folder' && handleFolderDrop(e, file.id)}
                      onDragOver={(e) => file.type === 'folder' && handleFolderDragOver(e)}
                      onDragLeave={(e) => file.type === 'folder' && handleFolderDragLeave(e)}
                      onClick={(e) => handleItemClick(e, file.id)}
                      onDoubleClick={() => handleItemDoubleClick(file)}
                      onContextMenu={(e) => handleContextMenu(e, file.id)}
                      className={clsx(
                        "cursor-pointer transition-colors",
                        selectedFileId === file.id && "bg-blue-50 dark:bg-blue-900/20"
                      )}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.type, 20)}
                          <span className="font-medium text-slate-900 dark:text-white">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500">{file.date}</td>
                      <td className="px-5 py-4 text-slate-500">{formatSize(file.size)}</td>
                      <td className="px-5 py-4 text-slate-500">{file.subject || '-'}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-4"
            >
              <Folder size={36} className="text-blue-500" />
            </motion.div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Files Yet</h3>
            <p className="text-sm text-slate-500 mb-4">Upload a file or create a folder to get started</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => { e.stopPropagation(); setIsUploading(true); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium"
            >
              <Upload size={18} /> Upload File
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1 w-48 overflow-hidden"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => {
                const file = files.find(f => f.id === contextMenu.fileId);
                if (file) handleItemDoubleClick(file);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3"
            >
              <ExternalLink size={16} /> Open
            </button>
            <button 
              onClick={() => {
                const file = files.find(f => f.id === contextMenu.fileId);
                if (file) {
                  setRenamingId(file.id);
                  setRenameValue(file.name);
                }
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3"
            >
              <Edit2 size={16} /> Rename
            </button>
            <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
            <button 
              onClick={() => {
                handleDelete(contextMenu.fileId);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
            >
              <Trash2 size={16} /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Folder Modal */}
      <AnimatePresence>
        {isCreatingFolder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-blue-500 text-white">
                  <FolderPlus size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">New Folder</h3>
              </div>
              <input
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-6"
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsCreatingFolder(false)}
                  className="px-5 py-2.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold"
                >
                  Create
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl w-full max-w-lg shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500 text-white">
                    <Upload size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedFile ? 'File Details' : 'Upload File'}
                  </h3>
                </div>
                <button onClick={() => { setIsUploading(false); setSelectedFile(null); }} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              {!selectedFile ? (
                <motion.div 
                  whileHover={{ borderColor: '#3b82f6' }}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center cursor-pointer bg-slate-50 dark:bg-slate-800/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <Upload size={32} />
                  </motion.div>
                  <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-slate-500">Any file type supported</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="p-3 bg-white dark:bg-slate-700 rounded-xl shadow-sm">
                      {getFileIcon(selectedFile.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">{formatSize(selectedFile.size)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
                      <input
                        type="text"
                        value={fileMeta.name}
                        onChange={(e) => setFileMeta({ ...fileMeta, name: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
                      <CustomSelect
                        value={fileMeta.subject}
                        onChange={(val) => setFileMeta({ ...fileMeta, subject: val })}
                        options={[{ value: '', label: 'Select Subject' }, ...subjectOptions]}
                        placeholder="Select Subject"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tags (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. notes, important, exam"
                        value={fileMeta.tags}
                        onChange={(e) => setFileMeta({ ...fileMeta, tags: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>

                  {uploadProgress > 0 && (
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="bg-blue-600 h-2 rounded-full"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => { setIsUploading(false); setSelectedFile(null); }}
                      className="px-5 py-2.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveFile}
                      disabled={!fileMeta.subject || uploadProgress > 0}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold"
                    >
                      {uploadProgress > 0 ? 'Saving...' : 'Save File'}
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FileOrganizerPage;
