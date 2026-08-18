import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // For Phase 1 Dashboard only
  if (pathnames.length === 0 || pathnames[0] === 'dashboard') {
    return (
      <div className="flex items-center text-sm font-medium text-gray-400">
        <Home size={16} className="mr-2" />
        <span className="text-white">Dashboard</span>
      </div>
    );
  }

  // Future scalable breadcrumbs
  return (
    <div className="flex items-center text-sm font-medium text-gray-400">
      <Link to="/dashboard" className="hover:text-white transition-colors flex items-center">
        <Home size={16} />
      </Link>
      
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = name.charAt(0).toUpperCase() + name.slice(1);

        return (
          <React.Fragment key={name}>
            <ChevronRight size={14} className="mx-1" />
            {isLast ? (
              <span className="text-white">{displayName}</span>
            ) : (
              <Link to={routeTo} className="hover:text-white transition-colors">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;
