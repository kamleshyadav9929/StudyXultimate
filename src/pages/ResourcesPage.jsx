import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link2, ExternalLink, Plus, Trash2, BookOpen, Video, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import CustomSelect from '../components/ui/CustomSelect';

const ResourcesPage = () => {
  const { state, updateSection } = useApp();
  const [selectedSubject, setSelectedSubject] = useState(Object.keys(state.subjects)[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newResource, setNewResource] = useState({ title: '', url: '', type: 'link' });

  // Ensure resources object exists safely
  const resources = state.resources?.[selectedSubject] || [];

  const handleAddResource = (e) => {
    e.preventDefault();
    if (!newResource.title || !newResource.url) return;

    // Create deep copy of resources to avoid mutation issues
    const currentResources = state.resources || {};
    const subjectResources = currentResources[selectedSubject] || [];
    
    const updatedResources = {
      ...currentResources,
      [selectedSubject]: [
        ...subjectResources,
        { ...newResource, id: Date.now().toString() }
      ]
    };

    updateSection('resources', updatedResources);
    setNewResource({ title: '', url: '', type: 'link' });
    setIsModalOpen(false);
  };

  const handleDeleteResource = (id) => {
    if (!state.resources) return;
    
    const updatedResources = {
      ...state.resources,
      [selectedSubject]: (state.resources[selectedSubject] || []).filter(r => r.id !== id)
    };
    updateSection('resources', updatedResources);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'video': return <Video size={20} />;
      case 'pdf': return <FileText size={20} />;
      default: return <Link2 size={20} />;
    }
  };

  const typeOptions = [
    { value: 'link', label: 'Website Link' },
    { value: 'video', label: 'Video / Playlist' },
    { value: 'pdf', label: 'PDF / Document' }
  ];

  const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) 
      ? `https://img.youtube.com/vi/${match[2]}/0.jpg`
      : null;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* ... header content ... */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Resource Manager</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Curate your study materials and links.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} />
          Add Resource
        </button>
      </header>

      {/* Subject Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto no-scrollbar">
        {Object.keys(state.subjects).map(sub => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
              selectedSubject === sub 
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            {state.subjects[sub]?.shortName || sub}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p>No resources added yet for this subject.</p>
          </div>
        ) : (
          resources.map(resource => {
            const thumbnail = resource.type === 'video' ? getYouTubeThumbnail(resource.url) : null;
            
            return (
              <div key={resource.id} className="group bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 rounded-xl hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/5 flex flex-col">
                {thumbnail && (
                  <div className="mb-3 rounded-lg overflow-hidden aspect-video relative bg-slate-100 dark:bg-slate-800">
                    <img src={thumbnail} alt={resource.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Video size={20} className="text-red-600 ml-1" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-2">
                  {!thumbnail && (
                    <div className={`p-2 rounded-lg ${
                      resource.type === 'video' ? 'bg-red-500/10 text-red-500' :
                      resource.type === 'pdf' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {getIcon(resource.type)}
                    </div>
                  )}
                  <div className="flex-1"></div>
                  <button 
                    onClick={() => handleDeleteResource(resource.id)}
                    className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all ml-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">{resource.title}</h3>
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-500 flex items-center gap-1 break-all mt-auto pt-2"
                >
                  <ExternalLink size={12} />
                  {new URL(resource.url).hostname.replace('www.', '')}
                </a>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Add New Resource</h2>
            <form onSubmit={handleAddResource} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  value={newResource.title}
                  onChange={e => setNewResource({...newResource, title: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., React Documentation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">URL</label>
                <input 
                  type="url" 
                  required
                  value={newResource.url}
                  onChange={e => setNewResource({...newResource, url: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Type</label>
                <CustomSelect 
                  value={newResource.type}
                  onChange={(val) => setNewResource({...newResource, type: val})}
                  options={typeOptions}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
                >
                  Add Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
