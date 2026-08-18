import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export const TextInput = forwardRef(
  ({ label, icon: Icon, rightElement, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3.5 text-gray-400 pointer-events-none">
              <Icon size={18} />
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full py-3 ${Icon ? 'pl-10' : 'pl-4'} ${rightElement ? 'pr-12' : 'pr-4'} 
              bg-[#11161d]/80 border ${error ? 'border-red-500/80 focus:border-red-500' : 'border-white/10 focus:border-pink-500/60'} 
              rounded-xl text-white text-sm placeholder:text-gray-500 
              focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/20' : 'focus:ring-pink-500/20'} 
              transition-all duration-200
              ${className}
            `}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3.5 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
        {error ? (
          <span className="flex items-center gap-1 text-xs text-red-400 font-medium mt-0.5">
            <AlertCircle size={13} />
            {error}
          </span>
        ) : helperText ? (
          <span className="text-[11px] text-gray-400">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;
