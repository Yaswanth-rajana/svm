export const AuthCard = ({ children, className = '' }) => {
  return (
    <div className={`relative w-full max-w-md p-6 sm:p-8 rounded-2xl glass-panel animate-fade-in animate-pulse-glow shadow-2xl border border-white/10 ${className}`}>
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent rounded-full" />
      {children}
    </div>
  );
};

export default AuthCard;
