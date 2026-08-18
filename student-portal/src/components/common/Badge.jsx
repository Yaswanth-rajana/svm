export const Badge = ({ children, variant = 'pink', className = '' }) => {
  const variantStyles = {
    pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    gray: 'bg-white/5 text-gray-400 border-white/10',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide uppercase font-mono ${variantStyles[variant] || variantStyles.pink} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
