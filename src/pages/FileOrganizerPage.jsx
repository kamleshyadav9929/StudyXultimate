import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Folder, FileText, Image, FileCode, Upload, Search, Trash2, Tag, ExternalLink, File, X, Download, Eye, FolderPlus, ChevronRight, ArrowLeft, MoreVertical, Grid, List as ListIcon, Edit2, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { clsx } from 'clsx';
import CustomSelect from '../components/ui/CustomSelect';
import { saveFileToDB, getFileFromDB, deleteFileFromDB, getAllFilesFromDB } from '../utils/fileStorage';

const FileOrganizerPage = () => {
  const { state } = useApp();
  
  const [files, setFiles] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  // Folder State
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);

  // Selection & Context Menu
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null); // { x, y, fileId }
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // New File State
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileMeta, setFileMeta] = useState({ name: '', subject: '', tags: '' });
  const [newFolderName, setNewFolderName] = useState('');
  
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    loadFiles();
    const handleClickOutside = () => {
      setContextMenu(null);
      // Don't clear selection here to allow keeping selection while clicking empty space? 
      // Windows behavior: clicking empty space clears selection.
      // But clicking context menu shouldn't.
    };
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

  // --- Drag & Drop for Upload ---
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // --- Drag & Drop for Moving Files ---
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
    // Remove drag styling
    e.currentTarget.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
  };

  const handleFolderDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    e.currentTarget.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
  };

  const handleFolderDragLeave = (e) => {
    e.currentTarget.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
  };

  // --- File Actions ---
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setFileMeta({ name: file.name, subject: '', tags: '' });
    setIsUploading(true);
  };

  const handleSaveFile = async () => {
    if (!selectedFile || !fileMeta.name || !fileMeta.subject) return;

    setUploadProgress(10);
    const reader = new FileReader();
    reader.onload = async (e) => {
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
        alert("Failed to save file.");
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
    if (window.confirm("Are you sure you want to delete this?")) {
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

  // --- Interaction Handlers ---
  const handleItemClick = (e, id) => {
    e.stopPropagation();
    setSelectedFileId(id);
    setContextMenu(null);
    if (renamingId && renamingId !== id) {
      setRenamingId(null); // Cancel rename if clicking elsewhere
    }
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

  const handleBackgroundClick = () => {
    setSelectedFileId(null);
    setContextMenu(null);
    setRenamingId(null);
  };

  const startRenaming = (file) => {
    setRenamingId(file.id);
    setRenameValue(file.name);
    setContextMenu(null);
  };

  // --- Navigation ---
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

  // --- Helpers ---
  const getFileIcon = (mimeType) => {
    if (mimeType === 'folder') return <Folder className="text-blue-500 fill-blue-500/20" size={24} />;
    if (mimeType.startsWith('image/')) return <Image className="text-purple-500" size={24} />;
    if (mimeType.includes('pdf')) return <FileText className="text-red-500" size={24} />;
    if (mimeType.includes('code') || mimeType.includes('javascript') || mimeType.includes('html')) return <FileCode className="text-blue-500" size={24} />;
    return <File className="text-slate-400" size={24} />;
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const subjects = ['All', ...Object.keys(state.subjects)];
  const subjectOptions = Object.keys(state.subjects).map(s => ({ value: s, label: s }));

  const filteredItems = files.filter(file => {
    const fileParent = file.parentId || null;
    if (fileParent !== currentFolder) return false;
    
    const matchesSubject = selectedSubject === 'All' || file.subject === selectedSubject || file.type === 'folder';
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (file.tags && file.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesSubject && matchesSearch;
  });

  filteredItems.sort((a, b) => {
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div 
      className="space-y-6 h-full flex flex-col" 
      onDragEnter={handleDrag}
      onClick={handleBackgroundClick}
      ref={containerRef}
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4" onClick={e => e.stopPropagation()}>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">File Organizer</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Securely store and manage all your study resources.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={clsx("p-2 rounded-md transition-all", viewMode === 'grid' ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={clsx("p-2 rounded-md transition-all", viewMode === 'list' ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}
            >
              <ListIcon size={18} />
            </button>
          </div>
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-5 py-2.5 rounded-xl transition-all font-medium"
          >
            <FolderPlus size={20} />
            New Folder
          </button>
          <button
            onClick={() => setIsUploading(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl transition-all font-medium shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Upload size={20} />
            Upload File
          </button>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto" onClick={e => e.stopPropagation()}>
        <button 
          onClick={() => navigateToBreadcrumb(-1)}
          className={clsx("hover:text-blue-500 font-medium transition-colors", currentFolder === null && "text-slate-900 dark:text-white")}
        >
          Home
        </button>
        {folderPath.map((folder, index) => (
          <React.Fragment key={folder.id}>
            <ChevronRight size={16} />
            <button 
              onClick={() => navigateToBreadcrumb(index)}
              className={clsx("hover:text-blue-500 font-medium transition-colors whitespace-nowrap", index === folderPath.length - 1 && "text-slate-900 dark:text-white")}
            >
              {folder.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Drag & Drop Overlay */}
      {dragActive && (
        <div 
          className="fixed inset-0 z-50 bg-blue-500/10 backdrop-blur-sm border-4 border-blue-500 border-dashed m-4 rounded-3xl flex items-center justify-center pointer-events-none"
        >
          <div className="text-center animate-bounce">
            <Upload size={64} className="text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-blue-700">Drop files here to upload</h2>
          </div>
        </div>
      )}

      {/* File View Area */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-20" onDragOver={e => e.preventDefault()} onDrop={e => e.preventDefault()}>
        {filteredItems.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredItems.map((file) => (
                <div 
                  key={file.id} 
                  draggable={file.type !== 'folder' && renamingId !== file.id}
                  onDragStart={(e) => handleFileDragStart(e, file.id)}
                  onDrop={(e) => file.type === 'folder' ? handleFolderDrop(e, file.id) : null}
                  onDragOver={(e) => file.type === 'folder' ? handleFolderDragOver(e) : null}
                  onDragLeave={(e) => file.type === 'folder' ? handleFolderDragLeave(e) : null}
                  onClick={(e) => handleItemClick(e, file.id)}
                  onDoubleClick={() => handleItemDoubleClick(file)}
                  onContextMenu={(e) => handleContextMenu(e, file.id)}
                  className={clsx(
                    "group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none",
                    selectedFileId === file.id 
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-sm ring-1 ring-blue-500" 
                      : "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-600 hover:shadow-md"
                  )}
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className={clsx(
                      "p-3 rounded-xl transition-transform duration-300",
                      file.type === 'folder' ? "bg-blue-100 dark:bg-blue-900/30" : "bg-slate-50 dark:bg-slate-800",
                      selectedFileId === file.id ? "scale-110" : "group-hover:scale-110"
                    )}>
                      {getFileIcon(file.type)}
                    </div>
                    
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
                          className="w-full text-center text-sm font-medium bg-white dark:bg-slate-800 border-2 border-blue-500 rounded px-1 py-0.5 focus:outline-none"
                        />
                      ) : (
                        <h3 className="font-medium text-slate-900 dark:text-white truncate text-sm" title={file.name}>
                          {file.name}
                        </h3>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {file.type === 'folder' ? 'Folder' : formatSize(file.size)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3 w-32">Date</th>
                    <th className="px-4 py-3 w-24">Size</th>
                    <th className="px-4 py-3 w-32">Subject</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredItems.map((file) => (
                    <tr 
                      key={file.id}
                      draggable={file.type !== 'folder' && renamingId !== file.id}
                      onDragStart={(e) => handleFileDragStart(e, file.id)}
                      onDrop={(e) => file.type === 'folder' ? handleFolderDrop(e, file.id) : null}
                      onDragOver={(e) => file.type === 'folder' ? handleFolderDragOver(e) : null}
                      onDragLeave={(e) => file.type === 'folder' ? handleFolderDragLeave(e) : null}
                      onClick={(e) => handleItemClick(e, file.id)}
                      onDoubleClick={() => handleItemDoubleClick(file)}
                      onContextMenu={(e) => handleContextMenu(e, file.id)}
                      className={clsx(
                        "group transition-colors cursor-pointer select-none",
                        selectedFileId === file.id 
                          ? "bg-blue-50 dark:bg-blue-900/20" 
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.type)}
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
                              className="w-full text-sm font-medium bg-white dark:bg-slate-800 border-2 border-blue-500 rounded px-1 py-0.5 focus:outline-none"
                            />
                          ) : (
                            <span className="font-medium text-slate-900 dark:text-white">{file.name}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{file.date}</td>
                      <td className="px-4 py-3 text-slate-500">{formatSize(file.size)}</td>
                      <td className="px-4 py-3 text-slate-500">{file.subject || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Folder size={40} className="opacity-50" />
            </div>
            <p className="text-lg font-medium text-slate-900 dark:text-white">No files found</p>
            <p className="text-sm">Upload a file or create a folder to get started</p>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 w-48 animate-in fade-in zoom-in-95"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => {
              const file = files.find(f => f.id === contextMenu.fileId);
              if (file) handleItemDoubleClick(file);
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
          >
            <ExternalLink size={14} /> Open
          </button>
          <button 
            onClick={() => {
              const file = files.find(f => f.id === contextMenu.fileId);
              if (file) startRenaming(file);
            }}
            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
          >
            <Edit2 size={14} /> Rename
          </button>
          <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
          <button 
            onClick={() => {
              handleDelete(contextMenu.fileId);
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}

      {/* Modals (Create Folder / Upload) - Same as before but kept for completeness */}
      {isCreatingFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Create New Folder</h3>
            <input
              type="text"
              placeholder="Folder Name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 mb-6"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsCreatingFolder(false)}
                className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedFile ? 'File Details' : 'Upload File'}
              </h3>
              <button onClick={() => { setIsUploading(false); setSelectedFile(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={24} />
              </button>
            </div>

            {!selectedFile ? (
              <div 
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-10 text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer bg-slate-50 dark:bg-slate-800/50"
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
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload size={32} />
                </div>
                <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-slate-500 dark:text-slate-500">Any file type supported</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                    {getFileIcon(selectedFile.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">{formatSize(selectedFile.size)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={fileMeta.name}
                      onChange={(e) => setFileMeta({ ...fileMeta, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                    <CustomSelect
                      value={fileMeta.subject}
                      onChange={(val) => setFileMeta({ ...fileMeta, subject: val })}
                      options={[{ value: '', label: 'Select Subject' }, ...subjectOptions]}
                      placeholder="Select Subject"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags</label>
                    <input
                      type="text"
                      placeholder="e.g. notes, important, exam"
                      value={fileMeta.tags}
                      onChange={(e) => setFileMeta({ ...fileMeta, tags: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {uploadProgress > 0 && (
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => { setIsUploading(false); setSelectedFile(null); }}
                    className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveFile}
                    disabled={!fileMeta.subject || uploadProgress > 0}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors font-medium"
                  >
                    {uploadProgress > 0 ? 'Saving...' : 'Save File'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileOrganizerPage;
