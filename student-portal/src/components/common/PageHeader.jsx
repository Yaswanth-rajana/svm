import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { ROUTES } from '../../constants/routes';

export const PageHeader = ({ title, subtitle, breadcrumbs = [], action }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10 mb-6 animate-fade-in">
      <div className="space-y-1.5">
        {/* Breadcrumbs Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 font-medium flex-wrap">
          <Link
            to={ROUTES.DASHBOARD}
            className="flex items-center gap-1 hover:text-pink-400 transition-colors"
          >
            <Home size={14} />
            <span>Dashboard</span>
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <ChevronRight size={12} className="text-gray-600 shrink-0" />
              {crumb.path ? (
                <Link to={crumb.path} className="hover:text-pink-400 transition-colors truncate max-w-[200px]">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-pink-400 font-semibold truncate max-w-[200px]">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>

        {/* Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
