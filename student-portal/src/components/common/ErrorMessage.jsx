import { AlertCircle, RefreshCw } from 'lucide-react';
import PrimaryButton from '../PrimaryButton';

export const ErrorMessage = ({
  title = 'Something went wrong',
  message = 'Failed to load data from server. Please check your connection and try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 animate-fade-in my-6">
      <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 mb-3">
        <AlertCircle size={24} />
      </div>
      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-red-200/80 max-w-md mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <PrimaryButton onClick={onRetry} fullWidth={false} className="py-2 px-4 text-xs">
          <RefreshCw size={14} />
          <span>Retry Loading</span>
        </PrimaryButton>
      )}
    </div>
  );
};

export default ErrorMessage;
