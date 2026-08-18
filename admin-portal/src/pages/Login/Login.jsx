import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Navigate } from 'react-router-dom';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ADMIN_ROUTES } from '../../constants/routes';

const Login = () => {
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();

  if (isAuthenticated) {
    return <Navigate to={ADMIN_ROUTES.DASHBOARD} replace />;
  }

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await login(data);
      navigate(ADMIN_ROUTES.DASHBOARD);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center p-4 relative overflow-hidden text-white font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff0064]/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8b5cf6]/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-[#ff0064] to-[#8b5cf6] flex items-center justify-center font-bold text-white shadow-[0_0_30px_rgba(255,0,100,0.4)] mb-6 text-3xl">
            S
          </div>
          <h1 className="text-3xl font-bold mb-2">SMVEN Admin</h1>
          <p className="text-gray-400">Sign in to manage the learning portal</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff0064] to-[#8b5cf6]"></div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-2">
            
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  autoComplete="username"
                  className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm"
                  placeholder="admin@smven.com"
                  {...register('email', { required: 'Email is required' })}
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs ml-1 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-gray-300">Password</label>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  autoComplete="current-password"
                  className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm"
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                  disabled={isLoading}
                />
              </div>
              {errors.password && <p className="text-red-400 text-xs ml-1 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#ff0064] to-[#8b5cf6] hover:opacity-90 rounded-xl text-sm font-bold text-white transition-all shadow-[0_0_20px_rgba(255,0,100,0.3)] hover:shadow-[0_0_30px_rgba(255,0,100,0.5)] flex items-center justify-center gap-2 group mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>For Phase 1 use:</p>
            <p className="font-mono mt-1 text-gray-400">admin@smven.com / SmvAdmin#2026!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
