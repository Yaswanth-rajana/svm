import React, { useState } from 'react';
import { Plus, Trash2, FileText, Image as ImageIcon, Link as LinkIcon, FileArchive, File, Download } from 'lucide-react';

const getResourceIcon = (type) => {
  switch(type) {
    case 'pdf': return <FileText size={16} className="text-red-400" />;
    case 'image': return <ImageIcon size={16} className="text-blue-400" />;
    case 'link': case 'github': return <LinkIcon size={16} className="text-green-400" />;
    case 'zip': return <FileArchive size={16} className="text-yellow-400" />;
    default: return <File size={16} className="text-gray-400" />;
  }
};

const ResourcesManager = ({ resources, setResources }) => {
  const [newResource, setNewResource] = useState({ title: '', type: 'other', url: '', size: 0 });

  const addResource = () => {
    if (!newResource.title || !newResource.url) return;
    
    setResources([...resources, { ...newResource, order: resources.length + 1 }]);
    setNewResource({ title: '', type: 'other', url: '', size: 0 });
  };

  const removeResource = (index) => {
    const updated = [...resources];
    updated.splice(index, 1);
    setResources(updated);
  };

  return (
    <div className="space-y-4">
      <div className="glass-panel p-4 rounded-xl border border-white/10 bg-black/40">
        <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
          <Download size={16} className="text-[#ff0064]" /> Add New Resource
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4">
            <input 
              type="text" 
              placeholder="Resource Title (e.g., Presentation Slides)" 
              value={newResource.title}
              onChange={(e) => setNewResource({...newResource, title: e.target.value})}
              className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff0064] transition-colors"
            />
          </div>
          <div className="md:col-span-3">
            <select
              value={newResource.type}
              onChange={(e) => setNewResource({...newResource, type: e.target.value})}
              className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff0064] transition-colors"
            >
              <option value="other">General File</option>
              <option value="pdf">PDF Document</option>
              <option value="zip">ZIP Archive</option>
              <option value="link">External Link</option>
              <option value="github">GitHub Repo</option>
              <option value="image">Image</option>
              <option value="doc">Word/PowerPoint</option>
            </select>
          </div>
          <div className="md:col-span-4">
            <input 
              type="text" 
              placeholder="URL or File Link" 
              value={newResource.url}
              onChange={(e) => setNewResource({...newResource, url: e.target.value})}
              className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#ff0064] transition-colors"
            />
          </div>
          <div className="md:col-span-1">
            <button 
              type="button"
              onClick={addResource}
              disabled={!newResource.title || !newResource.url}
              className="w-full h-full flex items-center justify-center bg-[#ff0064] hover:bg-[#ff0064]/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {resources.length > 0 && (
        <div className="space-y-2 mt-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Attached Resources ({resources.length})</h4>
          {resources.map((res, index) => (
            <div key={index} className="flex items-center justify-between p-3 glass-panel rounded-lg border border-white/5 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black/40 rounded-lg">
                  {getResourceIcon(res.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{res.title}</p>
                  <a href={res.url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline line-clamp-1 max-w-[300px]">
                    {res.url}
                  </a>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => removeResource(index)}
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesManager;
