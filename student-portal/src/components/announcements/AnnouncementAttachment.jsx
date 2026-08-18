import React from 'react';
import { FileText, Image as ImageIcon, Video, ExternalLink, Download, Eye } from 'lucide-react';

const getFileIcon = (fileType) => {
  switch (fileType) {
    case 'image':
      return <ImageIcon size={16} className="text-pink-400" />;
    case 'video':
      return <Video size={16} className="text-purple-400" />;
    case 'link':
      return <ExternalLink size={16} className="text-cyan-400" />;
    case 'pdf':
    default:
      return <FileText size={16} className="text-emerald-400" />;
  }
};

export const AnnouncementAttachment = ({ attachment }) => {
  if (!attachment) return null;

  const { title, fileType = 'pdf', url, size, allowDownload = true } = attachment;

  const handlePreview = (e) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.download = title || 'attachment';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 shrink-0">
          {getFileIcon(fileType)}
        </div>
        <div className="min-w-0">
          <h5 className="text-xs font-bold text-white truncate">{title}</h5>
          {size && <p className="text-[10px] font-mono text-gray-400">{size}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handlePreview}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-200 bg-white/10 hover:bg-white/20 border border-white/15 transition-all active:scale-95"
          title="Preview Resource"
        >
          <Eye size={13} className="text-cyan-400" />
          <span>Preview</span>
        </button>

        {allowDownload && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-pink-300 bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 transition-all active:scale-95"
            title="Download File"
          >
            <Download size={13} className="text-pink-400" />
            <span>Download</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AnnouncementAttachment;
