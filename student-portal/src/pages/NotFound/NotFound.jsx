import { Link } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import AuthCard from '../../components/AuthCard';
import PrimaryButton from '../../components/PrimaryButton';
import { ROUTES } from '../../constants/routes';
import { FileQuestion, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <AuthLayout>
      <AuthCard className="text-center">
        <div className="space-y-4 py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-400">
            <FileQuestion size={32} />
          </div>
          
          <h1 className="text-4xl font-extrabold text-white">404</h1>
          
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-gray-200">Page Not Found</h2>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              The portal page you are looking for does not exist or has been moved.
            </p>
          </div>

          <div className="pt-4">
            <Link to={ROUTES.DASHBOARD}>
              <PrimaryButton>
                <Home size={16} />
                <span>Return to Dashboard</span>
              </PrimaryButton>
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default NotFound;
