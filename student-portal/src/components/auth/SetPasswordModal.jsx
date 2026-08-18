import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ShieldCheck, Eye, EyeOff, Check, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import TextInput from '../TextInput';
import PrimaryButton from '../PrimaryButton';

const PasswordRule = ({ met, text }) => (
  <div className={`flex items-center gap-1.5 text-[11px] ${met ? 'text-emerald-400' : 'text-gray-500'}`}>
    {met ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-600" />}
    <span>{text}</span>
  </div>
);

export const SetPasswordModal = ({ onClose }) => {
  const { setPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const passwordValue = watch('password') || '';
  
  const rules = {
    length: passwordValue.length >= 8,
    upper: /[A-Z]/.test(passwordValue),
    lower: /[a-z]/.test(passwordValue),
    number: /[0-9]/.test(passwordValue),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue),
  };

  const strengthScore = Object.values(rules).filter(Boolean).length;
  let strengthLabel = 'Weak';
  let strengthColor = 'bg-red-500';
  if (strengthScore >= 3) {
    strengthLabel = 'Medium';
    strengthColor = 'bg-amber-500';
  }
  if (strengthScore === 5) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
  }

  const onSubmit = async (data) => {
    if (strengthScore < 5) {
      toast.error('Please meet all password requirements');
      return;
    }
    
    setLoading(true);
    try {
      await setPassword(data.password);
      toast.success('Password created successfully! You can now login with it.');
      onClose();
    } catch (err) {
      console.error('Set Password Error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to set password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-[#0b0f14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Secure Your Account</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Create a password for faster future logins. You can still use Email OTP anytime.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextInput
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.password?.message}
              rightElement={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-1 text-gray-400 hover:text-white transition-colors" tabIndex="-1">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              {...register('password')}
            />

            {/* Password Strength Indicator */}
            {passwordValue && (
              <div className="space-y-2 py-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-semibold">Password Strength</span>
                  <span className={`font-bold ${strengthLabel === 'Strong' ? 'text-emerald-400' : strengthLabel === 'Medium' ? 'text-amber-400' : 'text-red-400'}`}>
                    {strengthLabel}
                  </span>
                </div>
                <div className="flex gap-1 h-1.5">
                  <div className={`flex-1 rounded-full ${strengthScore >= 1 ? strengthColor : 'bg-white/10'}`} />
                  <div className={`flex-1 rounded-full ${strengthScore >= 3 ? strengthColor : 'bg-white/10'}`} />
                  <div className={`flex-1 rounded-full ${strengthScore >= 5 ? strengthColor : 'bg-white/10'}`} />
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 pt-2">
                  <PasswordRule met={rules.length} text="8+ characters" />
                  <PasswordRule met={rules.upper} text="Uppercase" />
                  <PasswordRule met={rules.lower} text="Lowercase" />
                  <PasswordRule met={rules.number} text="Number" />
                  <PasswordRule met={rules.special} text="Special character" />
                </div>
              </div>
            )}

            <TextInput
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              rightElement={
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="p-1 text-gray-400 hover:text-white transition-colors" tabIndex="-1">
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              {...register('confirmPassword', {
                validate: v => v === passwordValue || 'Passwords do not match'
              })}
            />

            <div className="pt-4 space-y-3">
              <PrimaryButton type="submit" isLoading={loading}>
                <span>Create Password</span>
                <ArrowRight size={16} />
              </PrimaryButton>
              
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full py-3 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
              >
                Skip For Now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetPasswordModal;
