import React, { useState, useEffect } from 'react';
import { PromptData } from '../types';
import { analyzePromptContent } from '../services/geminiService';
import { Icons } from './Icon';

interface PromptEditorProps {
  initialData?: PromptData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PromptData) => void;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({ initialData, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [breakdown, setBreakdown] = useState('');
  const [sourceLink, setSourceLink] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setBreakdown(initialData.breakdown);
      setSourceLink(initialData.sourceLink || '');
      setTags(initialData.tags || []);
    } else {
      // Reset form for new entry
      setTitle('');
      setContent('');
      setBreakdown('');
      setSourceLink('');
      setTags([]);
    }
  }, [initialData, isOpen]);

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzePromptContent(content);
      setTitle(result.title);
      setBreakdown(result.breakdown);
      setTags(result.tags);
    } catch (error) {
      alert("Failed to analyze prompt. Please ensure your API key is set.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert("Title and Prompt Content are required.");
      return;
    }

    const newData: PromptData = {
      id: initialData?.id || crypto.randomUUID(),
      title,
      content,
      breakdown,
      sourceLink: sourceLink.trim(),
      tags,
      createdAt: initialData?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    onSave(newData);
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? 'Edit Prompt' : 'New Prompt'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <Icons.X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">The Prompt</label>
            <textarea
              className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-banana-400 focus:border-banana-400 outline-none resize-none font-mono text-sm bg-gray-50"
              placeholder="Paste your prompt here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !content.trim()}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isAnalyzing || !content.trim()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Analyzing with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Icons.Sparkles size={16} />
                    <span>Analyze & Fill Details</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Title</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-banana-400 focus:border-banana-400 outline-none transition-shadow"
                placeholder="e.g., Cyberpunk City Generator"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Source Link Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Source Link <span className="text-gray-400 font-normal">(Optional)</span></label>
              <div className="relative">
                <Icons.Link className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="url"
                  className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-banana-400 focus:border-banana-400 outline-none transition-shadow"
                  placeholder="https://twitter.com/..."
                  value={sourceLink}
                  onChange={(e) => setSourceLink(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Breakdown/Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Breakdown & Explanation</label>
            <textarea
              className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-banana-400 focus:border-banana-400 outline-none resize-none text-sm leading-relaxed"
              placeholder="Explain how this prompt works or let AI generate it for you..."
              value={breakdown}
              onChange={(e) => setBreakdown(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-banana-100 text-banana-800">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-2 text-banana-600 hover:text-banana-900">
                    <Icons.X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-banana-400 outline-none text-sm"
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
              />
              <button 
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-200 font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-banana-500 hover:bg-banana-600 text-white shadow-lg shadow-banana-500/30 font-bold transition-all transform hover:-translate-y-0.5"
          >
            Save Prompt
          </button>
        </div>
      </div>
    </div>
  );
};