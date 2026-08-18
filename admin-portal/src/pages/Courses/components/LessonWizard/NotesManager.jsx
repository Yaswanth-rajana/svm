import React, { useState } from 'react';
import { FileText, Link as LinkIcon, Download, Upload } from 'lucide-react';
import { courseService } from '../../../../services/course.service';
import toast from 'react-hot-toast';

const NotesManager = ({ courseId, notes, setNotes }) => {
  const [isUploading, setIsUploading] = useState(false);
  const handleChange = (field, value) => {
    setNotes({ ...notes, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Notes Title</label>
        <input 
          type="text" 
          value={notes.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="e.g., Lesson Summary & Key Takeaways"
          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#ff0064] transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">PDF or Notes Link (Optional)</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText size={16} className="text-gray-500" />
            </div>
            <input 
              type="text" 
              value={notes.pdf}
              onChange={(e) => handleChange('pdf', e.target.value)}
              placeholder="Paste link (e.g. Google Drive) or upload file"
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#ff0064] transition-colors text-sm"
            />
          </div>
          
          <label 
            htmlFor="notes-pdf-upload"
            className={`px-4 py-2 border border-white/10 rounded-lg font-medium text-white transition-all text-xs flex items-center gap-1.5 cursor-pointer shrink-0 ${isUploading ? 'bg-white/5 opacity-50 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10'}`}
          >
            <Upload size={14} />
            <span>{isUploading ? 'Uploading...' : 'Upload PDF'}</span>
          </label>
          <input 
            id="notes-pdf-upload"
            type="file" 
            accept="application/pdf"
            className="hidden"
            disabled={isUploading}
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              
              const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
              if (!isPdf) {
                toast.error("Please select a valid PDF file");
                return;
              }
              
              setIsUploading(true);
              try {
                const res = await courseService.uploadLessonPDF(courseId, file);
                if (res.data?.success && res.data?.key) {
                  handleChange('pdf', res.data.key);
                  if (!notes.title) {
                    handleChange('title', file.name.replace(/\.[^/.]+$/, ""));
                  }
                  toast.success("Lesson PDF uploaded successfully");
                }
              } catch (err) {
                toast.error(err.response?.data?.message || "Failed to upload lesson PDF");
              } finally {
                setIsUploading(false);
                e.target.value = null;
              }
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 glass-panel rounded-xl border border-white/5 bg-white/5">
        <div className="p-2 bg-[#ff0064]/20 rounded-lg text-[#ff0064]">
          <Download size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-white">Allow Download</h4>
          <p className="text-xs text-gray-400">Students can download these notes as a file.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={notes.downloadable}
            onChange={(e) => handleChange('downloadable', e.target.checked)}
            className="sr-only peer" 
          />
          <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff0064]"></div>
        </label>
      </div>
    </div>
  );
};

export default NotesManager;
