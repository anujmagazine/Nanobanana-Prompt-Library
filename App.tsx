import React, { useState, useEffect, useMemo } from 'react';
import { PromptData } from './types';
import { getPrompts, savePrompt, deletePrompt } from './services/storageService';
import { PromptEditor } from './components/PromptEditor';
import { Icons } from './components/Icon';

const App: React.FC = () => {
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptData | null>(null);
  const [expandedPromptId, setExpandedPromptId] = useState<string | null>(null);

  // Initial Load
  useEffect(() => {
    setPrompts(getPrompts());
  }, []);

  const handleSavePrompt = (data: PromptData) => {
    const updatedPrompts = savePrompt(data);
    setPrompts(updatedPrompts);
  };

  const handleDeletePrompt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this prompt?')) {
      const updatedPrompts = deletePrompt(id);
      setPrompts(updatedPrompts);
    }
  };

  const openNewPrompt = () => {
    setEditingPrompt(null);
    setIsEditorOpen(true);
  };

  const openEditPrompt = (prompt: PromptData, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPrompt(prompt);
    setIsEditorOpen(true);
  };

  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  const openSourceLink = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Filter Logic
  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      const matchesSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTag = selectedTag ? p.tags.includes(selectedTag) : true;

      return matchesSearch && matchesTag;
    });
  }, [prompts, searchQuery, selectedTag]);

  // Collect all unique tags for the sidebar
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    prompts.forEach(p => p.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [prompts]);

  return (
    <div className="flex h-screen bg-gray-50 text-slate-800 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-banana-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">NanoBanana</h1>
          </div>
          
          <button 
            onClick={openNewPrompt}
            className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-xl transition-all shadow-lg shadow-slate-900/20 font-medium"
          >
            <Icons.Plus size={18} />
            <span>New Prompt</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Filters</h3>
            <button 
              onClick={() => setSelectedTag(null)}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${!selectedTag ? 'bg-banana-50 text-banana-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Icons.LayoutGrid size={16} />
              <span>All Prompts</span>
            </button>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tags</h3>
            <div className="space-y-1">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${selectedTag === tag ? 'bg-banana-50 text-banana-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Icons.Tag size={14} />
                  <span className="truncate">{tag}</span>
                </button>
              ))}
              {allTags.length === 0 && (
                <p className="text-xs text-gray-400 italic px-3">No tags yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100">
           <div className="text-xs text-gray-400 text-center">
             Ready for the Future
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:px-8 shrink-0">
          <div className="md:hidden flex items-center space-x-2">
            <div className="w-8 h-8 bg-banana-400 rounded-lg flex items-center justify-center">
               <span className="text-white font-bold">N</span>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search your library..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-banana-400 focus:bg-white transition-all outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
             <button onClick={openNewPrompt} className="md:hidden p-2 bg-slate-900 text-white rounded-lg">
                <Icons.Plus size={20} />
             </button>
          </div>
        </header>

        {/* Scrollable Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {filteredPrompts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Icons.Search size={32} className="text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">No prompts found</h2>
              <p className="text-gray-500 mb-6">
                {searchQuery ? `No results for "${searchQuery}"` : "Start building your prompt library for the future."}
              </p>
              {!searchQuery && (
                <button 
                  onClick={openNewPrompt}
                  className="px-6 py-2 bg-banana-500 text-white rounded-lg font-medium shadow-lg hover:bg-banana-600 transition-colors"
                >
                  Create First Prompt
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPrompts.map(prompt => (
                <div 
                  key={prompt.id} 
                  className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group ${
                    expandedPromptId === prompt.id ? 'col-span-1 lg:col-span-2 row-span-2' : ''
                  }`}
                >
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-gray-800 leading-tight line-clamp-2" title={prompt.title}>
                        {prompt.title}
                      </h3>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         {prompt.sourceLink && (
                           <button 
                             onClick={(e) => openSourceLink(prompt.sourceLink!, e)}
                             className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-blue-500"
                             title="Visit Source"
                           >
                             <Icons.ExternalLink size={16} />
                           </button>
                         )}
                         <button 
                            onClick={(e) => copyToClipboard(prompt.content, e)}
                            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-indigo-600"
                            title="Copy Prompt"
                         >
                            <Icons.Copy size={16} />
                         </button>
                         <button 
                            onClick={(e) => openEditPrompt(prompt, e)}
                            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-blue-600"
                            title="Edit"
                         >
                            <Icons.Edit2 size={16} />
                         </button>
                         <button 
                            onClick={(e) => handleDeletePrompt(prompt.id, e)}
                            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-red-600"
                            title="Delete"
                         >
                            <Icons.Trash2 size={16} />
                         </button>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                       <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 relative group/code">
                          <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap break-words line-clamp-4">
                            {prompt.content}
                          </pre>
                          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
                       </div>
                    </div>

                    <div className="mt-auto">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {prompt.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] uppercase font-bold tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                              {tag}
                            </span>
                          ))}
                          {prompt.tags.length > 3 && (
                             <span className="text-[10px] text-gray-400 py-1">+ {prompt.tags.length - 3}</span>
                          )}
                        </div>
                        
                        {prompt.breakdown && (
                          <div className="border-t border-gray-100 pt-3">
                            <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                               <span className="font-semibold text-gray-700 block mb-1">Breakdown:</span>
                               {prompt.breakdown}
                            </p>
                          </div>
                        )}
                        
                        <button 
                          onClick={() => setExpandedPromptId(expandedPromptId === prompt.id ? null : prompt.id)}
                          className="w-full mt-4 text-xs font-semibold text-banana-600 hover:text-banana-700 py-2 rounded-lg hover:bg-banana-50 transition-colors"
                        >
                          {expandedPromptId === prompt.id ? 'Show Less' : 'View Details'}
                        </button>
                    </div>
                  </div>
                  
                  {expandedPromptId === prompt.id && (
                    <div className="bg-slate-50 p-6 border-t border-gray-100 animate-fadeIn">
                       {prompt.sourceLink && (
                         <div className="mb-6">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Source Attribution</h4>
                            <a 
                              href={prompt.sourceLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <Icons.Link size={14} />
                              <span className="truncate max-w-full">{prompt.sourceLink}</span>
                            </a>
                         </div>
                       )}

                       <h4 className="text-sm font-bold text-gray-900 mb-2">Full Prompt</h4>
                       <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 font-mono text-sm text-gray-700 whitespace-pre-wrap select-all">
                          {prompt.content}
                       </div>
                       
                       <h4 className="text-sm font-bold text-gray-900 mb-2">Detailed Breakdown</h4>
                       <div className="prose prose-sm text-gray-600 whitespace-pre-wrap">
                          {prompt.breakdown}
                       </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <PromptEditor 
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSavePrompt}
        initialData={editingPrompt}
      />
    </div>
  );
};

export default App;