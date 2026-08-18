import LoadingSpinner from './LoadingSpinner';

export const PrimaryButton = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  isLoading = false,
  fullWidth = true,
  className = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative group overflow-hidden py-3.5 px-6 rounded-xl font-extrabold text-sm text-white
        bg-gradient-to-r from-pink-500 to-orange-500
        hover:from-pink-400 hover:to-orange-400
        hover:scale-[1.01] active:scale-[0.98] transition-all duration-200
        shadow-xl shadow-orange-500/20 hover:shadow-orange-500/35
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none
        flex items-center justify-center gap-2
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {/* Subtle shine highlight */}
      <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {isLoading ? (
        <>
          <LoadingSpinner size={18} className="text-white" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default PrimaryButton;
