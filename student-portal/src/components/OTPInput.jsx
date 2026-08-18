import { useRef } from 'react';
import { AlertCircle } from 'lucide-react';

export const OTPInput = ({ value, onChange, error, disabled = false }) => {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 6);
    onChange(rawVal);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
          Enter 6-Digit OTP Code
        </label>
        <span className="text-xs text-pink-400 font-mono">
          {value.length}/6 digits
        </span>
      </div>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="000000"
          autoFocus
          className={`
            w-full py-3.5 px-4 bg-[#11161d] border ${error ? 'border-red-500' : 'border-pink-500/30 focus:border-pink-500'} 
            text-white font-mono text-center tracking-[0.5em] text-xl rounded-xl 
            focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500/20' : 'focus:ring-pink-500/30'} 
            transition-all shadow-inner
          `}
        />
      </div>
      {error && (
        <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
          <AlertCircle size={13} />
          {error}
        </span>
      )}
    </div>
  );
};

export default OTPInput;
