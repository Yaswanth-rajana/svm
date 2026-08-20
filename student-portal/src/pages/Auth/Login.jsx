import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Mail, ArrowRight, RefreshCw, KeyRound, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AuthLayout from '../../layouts/AuthLayout';
import AuthCard from '../../components/AuthCard';
import TextInput from '../../components/TextInput';
import OTPInput from '../../components/OTPInput';
import PrimaryButton from '../../components/PrimaryButton';
import { ROUTES } from '../../constants/routes';
import { BRAND } from '../../constants/theme';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestOtp, verifyAndLogin, loginWithPassword, resetPassword } = useAuth();

  // Modes: 'password', 'otp-email', 'otp-verify', 'create-password', 'forgot-email', 'forgot-verify', 'forgot-reset'
  const [mode, setMode] = useState('password');
  
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setPassword: setAuthPassword } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: { email: location.state?.email || '', password: '', rememberMe: false, newPassword: '', confirmPassword: '', createPassword: '', confirmCreatePassword: '' },
  });

  const newPasswordValue = watch('newPassword');
  const createPasswordValue = watch('createPassword');

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const getDestination = () => location.state?.from?.pathname || ROUTES.DASHBOARD;

  const handlePasswordLogin = async (data) => {
    const targetEmail = data.email.trim().toLowerCase();
    setLoading(true);
    try {
      await loginWithPassword(targetEmail, data.password, data.rememberMe);
      toast.success('Logged in successfully!');
      navigate(getDestination(), { replace: true });
    } catch (err) {
      console.error('Login Error:', err);
      toast.error(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (data) => {
    const targetEmail = data.email.trim().toLowerCase();
    setLoading(true);
    try {
      const response = await requestOtp(targetEmail);
      setEmail(targetEmail);
      setMode(mode === 'otp-email' ? 'otp-verify' : 'forgot-verify');
      setTimer(30);

      if (response.bypass) {
        toast.success('Verification temporarily in bypass mode');
      } else {
        toast.success(response.message || `OTP sent successfully to ${targetEmail}`);
      }
    } catch (err) {
      console.error('Send OTP Error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpForLogin = async (e) => {
    e?.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the full 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyAndLogin(email, otp);
      toast.success('OTP verified successfully!');
      
      const isPasswordSet = result.passwordSet || result.passwordCreated;
      if (!isPasswordSet) {
        setMode('create-password');
      } else {
        navigate(getDestination(), { replace: true });
      }
    } catch (err) {
      console.error('Verify OTP Error:', err);
      toast.error(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePassword = async (data) => {
    setLoading(true);
    try {
      await setAuthPassword(data.createPassword);
      toast.success('Password created successfully!');
      navigate(getDestination(), { replace: true });
    } catch (err) {
      console.error('Create Password Error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to set password.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpForReset = async (e) => {
    e?.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the full 6-digit OTP code');
      return;
    }
    setMode('forgot-reset');
  };

  const handleResetPassword = async (data) => {
    setLoading(true);
    try {
      const response = await resetPassword(email, otp, data.newPassword);
      toast.success(response.message || 'Password reset successfully!');
      setMode('password');
      setOtp('');
      reset({ email, password: '', newPassword: '', confirmPassword: '', createPassword: '', confirmCreatePassword: '' });
    } catch (err) {
      console.error('Reset Password Error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || loading) return;
    setLoading(true);
    try {
      const response = await requestOtp(email);
      setTimer(30);
      toast.success(response.message || `New OTP code sent to ${email}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        {/* Header Branding */}
        <div className="text-center space-y-2 mb-6 animate-fade-in">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-400 mb-1">
            {['password', 'forgot-email', 'forgot-reset', 'create-password'].includes(mode) ? <KeyRound size={22} /> : <Mail size={22} />}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {mode === 'forgot-email' || mode === 'forgot-verify' || mode === 'forgot-reset' 
              ? 'Reset Password'
              : mode === 'create-password'
              ? 'Create Your Password' 
              : BRAND.APP_TITLE}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
            {mode === 'forgot-email' ? 'Enter your email to receive a reset code' :
             mode === 'forgot-verify' ? 'Enter the code sent to your email' :
             mode === 'forgot-reset' ? 'Create a new secure password' :
             mode === 'create-password' ? 'First-time setup: set your account password' :
             BRAND.SUBTITLE}
          </p>
        </div>

        {/* Mode: Password Login */}
        {mode === 'password' && (
          <form onSubmit={handleSubmit(handlePasswordLogin)} className="space-y-4 animate-fade-in">
            <TextInput
              label="Email Address"
              type="email"
              placeholder="student@example.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Please enter a valid email address',
                },
              })}
            />

            <TextInput
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={Lock}
              error={errors.password?.message}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              {...register('password', {
                required: 'Password is required',
              })}
            />

            <div className="flex items-center justify-between text-xs pt-1 pb-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="peer appearance-none w-4 h-4 border border-white/20 rounded bg-white/5 checked:bg-pink-500 checked:border-pink-500 transition-colors cursor-pointer"
                    {...register('rememberMe')}
                  />
                  <CheckCircle2 size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                </div>
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setMode('forgot-email');
                  setValue('email', watch('email'));
                }}
                className="text-pink-400 hover:text-pink-300 font-medium transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <PrimaryButton type="submit" isLoading={loading}>
              <span>Login</span>
              <ArrowRight size={16} />
            </PrimaryButton>

            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-[#11161d] text-[10px] uppercase font-bold tracking-widest text-gray-500">Or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setMode('otp-email');
                setValue('email', watch('email'));
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all duration-200"
            >
              <Mail size={16} className="text-pink-400" />
              <span>Continue with Email OTP</span>
            </button>
          </form>
        )}

        {/* Mode: Email for OTP or Forgot Password */}
        {(mode === 'otp-email' || mode === 'forgot-email') && (
          <form onSubmit={handleSubmit(handleSendOtp)} className="space-y-5 animate-fade-in">
            <TextInput
              label="Registered Email Address"
              type="email"
              placeholder="student@example.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Please enter a valid email address',
                },
              })}
            />

            <PrimaryButton type="submit" isLoading={loading}>
              <span>Send Verification Code</span>
              <ArrowRight size={16} />
            </PrimaryButton>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setMode('password')}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Back to Password Login
              </button>
            </div>
          </form>
        )}

        {/* Mode: Verify OTP (Login or Forgot) */}
        {(mode === 'otp-verify' || mode === 'forgot-verify') && (
          <form onSubmit={mode === 'otp-verify' ? handleVerifyOtpForLogin : handleVerifyOtpForReset} className="space-y-5 animate-fade-in">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div className="flex items-center gap-2 truncate pr-2">
                <CheckCircle2 size={16} className="text-pink-400 shrink-0" />
                <span className="text-gray-300 truncate font-mono">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => setMode(mode === 'otp-verify' ? 'otp-email' : 'forgot-email')}
                className="text-pink-400 hover:text-pink-300 font-semibold underline underline-offset-2 shrink-0"
              >
                Edit
              </button>
            </div>

            <OTPInput value={otp} onChange={setOtp} disabled={loading} />

            <PrimaryButton type="submit" isLoading={loading} disabled={otp.length !== 6}>
              <span>{mode === 'otp-verify' ? 'Verify & Login' : 'Verify & Continue'}</span>
              <ArrowRight size={16} />
            </PrimaryButton>

            <div className="pt-2 flex items-center justify-between border-t border-white/10 mt-4">
              <button
                type="button"
                onClick={() => setMode('password')}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Back to Login
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={timer > 0 || loading}
                className="text-xs flex items-center gap-1.5 text-pink-400 hover:text-pink-300 font-semibold disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        {/* Mode: First-Time Create Password */}
        {mode === 'create-password' && (
          <form onSubmit={handleSubmit(handleCreatePassword)} className="space-y-4 animate-fade-in">
            <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs text-pink-300 mb-2">
              🎉 Email verified successfully! Please set up your password to complete account setup.
            </div>

            <TextInput
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={Lock}
              error={errors.createPassword?.message}
              rightElement={
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="p-1 text-gray-400 hover:text-white transition-colors" tabIndex="-1">
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              {...register('createPassword', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' }
              })}
            />

            <TextInput
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={Lock}
              error={errors.confirmCreatePassword?.message}
              rightElement={
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="p-1 text-gray-400 hover:text-white transition-colors" tabIndex="-1">
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              {...register('confirmCreatePassword', {
                required: 'Please confirm your password',
                validate: v => v === createPasswordValue || 'Passwords do not match'
              })}
            />

            <div className="pt-2">
              <PrimaryButton type="submit" isLoading={loading}>
                <span>Create Password & Access Portal</span>
                <CheckCircle2 size={16} />
              </PrimaryButton>
            </div>
          </form>
        )}

        {/* Mode: Reset Password */}
        {mode === 'forgot-reset' && (
          <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4 animate-fade-in">
            <TextInput
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={Lock}
              error={errors.newPassword?.message}
              rightElement={
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="p-1 text-gray-400 hover:text-white transition-colors" tabIndex="-1">
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              {...register('newPassword', {
                required: 'New password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                validate: {
                  hasUpper: v => /[A-Z]/.test(v) || 'Must contain at least one uppercase letter',
                  hasLower: v => /[a-z]/.test(v) || 'Must contain at least one lowercase letter',
                  hasNumber: v => /[0-9]/.test(v) || 'Must contain at least one number',
                  hasSpecial: v => /[^A-Za-z0-9]/.test(v) || 'Must contain at least one special character'
                }
              })}
            />

            <TextInput
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={Lock}
              error={errors.confirmConfirmPassword?.message || errors.confirmPassword?.message}
              rightElement={
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="p-1 text-gray-400 hover:text-white transition-colors" tabIndex="-1">
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              {...register('confirmPassword', {
                required: 'Please confirm your new password',
                validate: v => v === newPasswordValue || 'Passwords do not match'
              })}
            />

            <div className="pt-2">
              <PrimaryButton type="submit" isLoading={loading}>
                <span>Reset Password</span>
                <CheckCircle2 size={16} />
              </PrimaryButton>
            </div>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
};

export default Login;
