import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, AlertCircle, RefreshCw, MessageCircle, Mail } from 'lucide-react';

const OtpVerification = ({ phone, email, onVerified, onReset }) => {
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Verified
  const [otp, setOtp] = useState('');
  
  const [channel, setChannel] = useState('whatsapp');
  const [contact, setContact] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [timer, setTimer] = useState(0);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  const showToast = (message, isError = false) => {
    if (isError) {
      setError(message);
      setSuccess('');
    } else {
      setSuccess(message);
      setError('');
    }
    // Clear success message after 5 seconds to prevent it staying forever
    if (!isError) {
      setTimeout(() => setSuccess(''), 5000);
    }
  };

  const handleSendOtp = async (selectedChannel = 'whatsapp') => {
    if (!phone && !email) {
      showToast('Please provide phone or email', true);
      return;
    }

    if (selectedChannel === 'whatsapp' && (!phone || phone.length < 10)) {
      showToast('Please enter a valid 10-digit phone number', true);
      return;
    }

    if (selectedChannel === 'email' && (!email || !email.includes('@'))) {
      showToast('Please enter a valid email address', true);
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await axios.post(`${API_URL}/api/send-otp`, {
        phone,
        email,
        channel: selectedChannel
      });
      
      setChannel(res.data.channel);
      setContact(res.data.contact);
      setStep(2);
      setTimer(15); // Start 15s timer for fallback
      
      if (res.data.fallback) {
        showToast(`Switched to ${res.data.channel === 'whatsapp' ? 'WhatsApp' : 'Email'} OTP`);
      } else {
        showToast(`OTP sent via ${res.data.channel === 'whatsapp' ? 'WhatsApp' : 'Email'}`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send OTP', true);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOTP = async () => {
    setOtp('');
    await handleSendOtp('email');
  };

  const handleWhatsAppOTP = async () => {
    setOtp('');
    await handleSendOtp('whatsapp');
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      showToast('Please enter a valid 6-digit OTP', true);
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await axios.post(`${API_URL}/api/verify-otp`, {
        contact,
        otp
      });
      
      showToast('Verified successfully!');
      setStep(3);
      if (onVerified) onVerified();
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid OTP', true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setOtp('');
    setTimer(0);
    setError('');
    setSuccess('');
    if (onReset) onReset();
  };

  if (step === 3) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">Verified</span>
          </div>
          <button 
            type="button" 
            onClick={handleReset} 
            className="text-xs text-pink-400 hover:text-pink-300 font-bold px-2 py-1 bg-pink-500/10 rounded-md transition-colors"
          >
            Change Number
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-2 rounded-lg border border-red-500/20">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 p-2 rounded-lg border border-green-500/20">
          <CheckCircle size={14} />
          {success}
        </div>
      )}

      {step === 1 ? (
        <button
          type="button"
          onClick={() => handleSendOtp('whatsapp')}
          disabled={loading || (!phone && !email)}
          className="w-full py-3 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold text-sm transition-all shadow-lg shadow-pink-500/20 active:scale-95 flex items-center justify-center gap-2"
        >
          {loading ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            'Verify Contact'
          )}
        </button>
      ) : (
        <div className="space-y-3 p-4 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Enter 6-digit OTP
            </label>
            <span className="text-xs text-pink-400 font-mono">
              {timer > 0 ? `00:${timer.toString().padStart(2, '0')}` : ''}
            </span>
          </div>
          
          <div className="flex gap-3">
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="flex-1 py-3 px-4 bg-[#11161d] border border-white/10 text-white font-mono text-center tracking-[0.5em] text-lg rounded-xl focus:outline-none focus:border-pink-500/50 transition-all"
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/20 active:scale-95 flex items-center justify-center min-w-[100px]"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : 'Confirm'}
            </button>
          </div>

          <div className="pt-3 border-t border-white/10 mt-3">
            <p className="text-xs text-gray-400 mb-2 text-center">Didn't receive OTP?</p>
            <div className="flex gap-2">
              {channel === 'whatsapp' ? (
                <>
                  <button
                    type="button"
                    onClick={handleWhatsAppOTP}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 transition-colors"
                  >
                    <MessageCircle size={14} className="text-green-400" />
                    Resend WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={handleEmailOTP}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 transition-colors"
                  >
                    <Mail size={14} className="text-blue-400" />
                    Send via Email
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleEmailOTP}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 transition-colors"
                  >
                    <Mail size={14} className="text-blue-400" />
                    Resend Email
                  </button>
                  <button
                    type="button"
                    onClick={handleWhatsAppOTP}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 transition-colors"
                  >
                    <MessageCircle size={14} className="text-green-400" />
                    Try WhatsApp
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtpVerification;
