import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Calendar } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export const CourseHeader = memo(({ course }) => {
  const accessExpiry = course.accessExpiry || 'Lifetime Access';
  const updatedDate = course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'Recently Updated';

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Link 
        to={ROUTES.DASHBOARD} 
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-pink-400 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Courses
      </Link>

      {/* Title & Metadata */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
          {course.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-mono pt-3">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-400" />
            {accessExpiry}
          </span>
          <span className="text-gray-600">•</span>
          <span className="flex items-center gap-1.5">
            <Calendar size={13} className="text-purple-400" />
            Updated {updatedDate}
          </span>
        </div>
      </div>
    </div>
  );
});

export default CourseHeader;
