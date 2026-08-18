import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 20, className = '' }) => {
  return (
    <Loader2
      size={size}
      className={`animate-spin text-pink-500 shrink-0 ${className}`}
    />
  );
};

export default LoadingSpinner;
