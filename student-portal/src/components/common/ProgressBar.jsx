import { formatProgress } from '../../utils/formatProgress';

export const ProgressBar = ({ progress = 0, showLabel = true, height = 'h-2', className = '' }) => {
  const percentage = formatProgress(progress);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Progress</span>
          <span className="font-mono font-bold text-pink-400">{percentage}%</span>
        </div>
      )}
      <div className={`w-full ${height} bg-white/10 rounded-full overflow-hidden border border-white/10 p-0.5 shadow-inner`}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(236,72,153,0.4)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
