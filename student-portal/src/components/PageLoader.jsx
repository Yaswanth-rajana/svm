import LoadingSpinner from './LoadingSpinner';

export const PageLoader = ({ message = 'Loading SMVEN Portal...' }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0b0f14] text-white p-4">
      <div className="relative flex flex-col items-center gap-4 p-8 rounded-2xl glass-panel animate-pulse-glow">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 p-0.5 shadow-lg shadow-pink-500/20">
          <div className="w-full h-full bg-[#0b0f14] rounded-[10px] flex items-center justify-center">
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400 text-lg">
              SMV
            </span>
          </div>
        </div>
        <LoadingSpinner size={28} />
        <p className="text-sm font-medium text-gray-400 animate-pulse">{message}</p>
      </div>
    </div>
  );
};

export default PageLoader;
