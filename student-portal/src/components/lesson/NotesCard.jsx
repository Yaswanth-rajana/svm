import React, { useState } from 'react';
import { FileText, Lock, Download } from 'lucide-react';
import Badge from '../common/Badge';
import { formatFileSize } from '../../utils/formatFileSize';
import courseService from '../../services/course.service';

export const NotesCard = ({ courseId, lessonId, notes }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  if (!notes || !notes.title || (!notes.pdf && !notes.fileKey)) return null;

  const handleViewNotes = async () => {
    if (isViewing) return;
    setIsViewing(true);
    try {
      if (!notes.pdf && notes.fileKey) {
        // Fallback for static mock demo dataset
        window.open("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "_blank", "noopener,noreferrer");
        return;
      }
      const res = await courseService.getLessonNotesPDFViewUrl(courseId, lessonId);
      if (res.success && res.url) {
        window.open(res.url, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Failed to view notes PDF:", err);
      alert("Failed to retrieve secure view link. Please try again.");
    } finally {
      setIsViewing(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl glass-panel border border-blue-500/20 shadow-xl space-y-4 bg-gradient-to-r from-blue-950/20 via-purple-950/10 to-transparent">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FileText size={18} />
          </div>
          <h4 className="text-sm font-bold text-white">Course Study Material & Notes</h4>
         </div>
         <Badge variant="blue">PDF Document</Badge>
       </div>

       <div className="p-4 rounded-xl bg-[#11161d] border border-white/10 flex items-center justify-between gap-4">
         <div className="flex items-center gap-3 min-w-0">
           <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-xs uppercase shrink-0 font-mono">
             PDF
           </div>
           <div className="min-w-0 space-y-0.5">
             <h5 className="text-xs sm:text-sm font-semibold text-white truncate" title={notes.title}>
               {notes.title}
             </h5>
             <span className="text-[11px] text-gray-400 font-mono block">
               File Size: {formatFileSize(notes.size || 2450000)}
             </span>
           </div>
         </div>

         <div className="flex items-center gap-2 shrink-0">
           {/* View Notes Button - Always Available */}
           <button
             type="button"
             onClick={handleViewNotes}
             disabled={isViewing}
             className="py-2 px-3.5 rounded-xl bg-[#ff0064]/10 hover:bg-[#ff0064]/20 border border-[#ff0064]/20 text-[#ff0064] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
           >
             <FileText size={13} />
             <span>{isViewing ? 'Viewing...' : 'View Notes'}</span>
           </button>

           {/* Download Notes Button - Conditional */}
           {notes.downloadable !== false ? (
             <button
               type="button"
               onClick={async () => {
                 if (isDownloading) return;
                 setIsDownloading(true);
                 try {
                   if (!notes.pdf && notes.fileKey) {
                     // Fallback for static mock demo dataset
                     const link = document.createElement('a');
                     link.href = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
                     link.setAttribute('download', `${notes.title || "Lesson_Notes"}.pdf`);
                     link.target = "_blank";
                     document.body.appendChild(link);
                     link.click();
                     document.body.removeChild(link);
                     return;
                   }
                   const res = await courseService.getLessonNotesPDFDownloadUrl(courseId, lessonId);
                   if (res.success && res.url) {
                     const link = document.createElement('a');
                     link.href = res.url;
                     link.setAttribute('download', `${notes.title || "Lesson_Notes"}.pdf`);
                     document.body.appendChild(link);
                     link.click();
                     document.body.removeChild(link);
                   }
                 } catch (err) {
                   console.error("Failed to download notes PDF:", err);
                   alert("Failed to retrieve secure download link. Please try again.");
                 } finally {
                   setIsDownloading(false);
                 }
               }}
               className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#ff0064] to-[#8b5cf6] hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-pink-500/20 transition-all cursor-pointer"
             >
               <Download size={13} />
               <span>{isDownloading ? 'Downloading...' : 'Download Notes'}</span>
             </button>
           ) : (
             <div className="py-2 px-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 text-xs font-medium flex items-center gap-1.5">
               <Lock size={13} className="text-gray-600" />
               <span>Download Locked</span>
             </div>
           )}
         </div>
       </div>
     </div>
   );
};

export default NotesCard;
