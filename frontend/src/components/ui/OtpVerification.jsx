import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { CheckCircle, AlertCircle, RefreshCw, MessageCircle, Mail, Info, X, ShieldCheck } from 'lucide-react';
import { normalizePhone } from '../../utils/phone';
import { getApiUrl } from '../../config/apiConfig';

const OtpVerification = ({ 
  phone, 
  email, 
  fullName, 
  program, 
  isVerified, 
  verifiedPhone, 
  onVerified, 
  onReset, 
  isExpired 
}) => {
  const isBypass = import.meta.env.VITE_DISABLE_OTP_VALIDATION === 'true';

  useEffect(() => {
    if (isBypass) {
      onVerified && onVerified({ bypass: true, verified: true, phone: normalizePhone(phone) });
    }
  }, [isBypass, onVerified, phone]);

  if (isBypass) {
    return (
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
        <div className="flex items-start gap-2.5">
          <Info className="w-5 h-5 shrink-0 text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-white">Verification Temporarily Disabled</p>
            <p className="text-xs text-gray-400 mt-1">
              Due to ongoing email service maintenance, OTP verification is temporarily unavailable. You may continue normally.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [channel, setChannel] = useState('whatsapp');
  const [contact, setContact] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
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
  }, [timer]);

  // Lock background scroll when OTP modal is open
  useEffect(() => {
    if (isModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isModalOpen]);

  const showToast = (message, isError = false) => {
    if (isError) {
      setError(message);
      setSuccess('');
    } else {
      setSuccess(message);
      setError('');
    }
    if (!isError) {
      setTimeout(() => setSuccess(''), 5000);
    }
  };

  const handleSendOtp = async (selectedChannel = 'whatsapp') => {
    if (!fullName || fullName.trim() === '') {
      showToast('Full Name is required before verification', true);
      return;
    }

    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address before verification', true);
      return;
    }

    if (!phone || phone.length < 10) {
      showToast('Please enter a valid 10-digit phone number before verification', true);
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const API_URL = getApiUrl();
      const res = await axios.post(`${API_URL}/api/send-otp`, {
        phone: normalizePhone(phone),
        email,
        channel: selectedChannel,
        program: program === 'infrastructure' ? 'it-infrastructure' : (program || 'it-infrastructure')
      });
      
      setChannel(res.data.channel || selectedChannel);
      setContact(res.data.contact || normalizePhone(phone));
      setOtp('');
      setTimer(30);
      setIsModalOpen(true);
      
      if (res.data.fallback) {
        showToast(`Switched to ${res.data.channel === 'whatsapp' ? 'WhatsApp' : 'Email'} OTP`);
      } else {
        showToast(`OTP sent via ${res.data.channel === 'whatsapp' ? 'WhatsApp' : 'Email'}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.';
      showToast(msg, true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!otp || otp.length !== 6) {
      showToast('Please enter a valid 6-digit OTP', true);
      return;
    }

    setError('');
    setSuccess('');
    setVerifying(true);
    
    try {
      const API_URL = getApiUrl();
      const targetContact = contact || normalizePhone(phone);
      
      const res = await axios.post(`${API_URL}/api/verify-otp`, {
        contact: targetContact,
        otp: otp.trim(),
        program: program === 'infrastructure' ? 'it-infrastructure' : (program || 'it-infrastructure')
      });
      
      if (res.data && (res.data.success === true || res.data.verified === true)) {
        showToast('Verified successfully!');
        setIsModalOpen(false);
        setOtp('');
        
        if (onVerified) {
          onVerified({
            verified: true,
            phone: normalizePhone(phone),
            contact: targetContact,
            verificationToken: res.data.verificationToken,
            expiresAt: res.data.expiresAt,
            data: res.data
          });
        }
      } else {
        showToast(res.data?.message || 'Verification failed. Please check the OTP.', true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP. Please check and try again.';
      showToast(msg, true);
    } finally {
      setVerifying(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError('');
    setSuccess('');
  };

  const handleReset = () => {
    setIsModalOpen(false);
    setOtp('');
    setTimer(0);
    setError('');
    setSuccess('');
    if (onReset) onReset();
  };

  const displayPhone = verifiedPhone || (phone ? normalizePhone(phone) : '');

  // 1. Render Verified State (Persistent green badge with verified phone)
  if (isVerified) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
          <div className="flex items-center gap-2.5">
            <CheckCircle size={18} className="text-green-400 shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-left">
              <span className="text-sm font-bold text-green-400">Verified</span>
              {displayPhone && (
                <span className="text-xs text-green-300/80 font-mono">
                  ({displayPhone})
                </span>
              )}
            </div>
          </div>
          <button 
            type="button" 
            onClick={handleReset} 
            className="text-xs text-pink-400 hover:text-pink-300 font-bold px-2.5 py-1 bg-pink-500/10 hover:bg-pink-500/20 rounded-md transition-colors"
          >
            Change Number
          </button>
        </div>
      </div>
    );
  }

  // 2. Render Expired State
  if (isExpired) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="text-amber-400 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold text-amber-200">Phone Verification Expired</p>
              <p className="text-[11px] text-amber-300/80">Please refresh verification to continue</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => handleSendOtp('whatsapp')} 
            disabled={loading}
            className="text-xs text-white font-bold px-3 py-1.5 bg-amber-500 hover:bg-amber-400 rounded-lg transition-all shadow-md active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Verify Again
          </button>
        </div>
      </div>
    );
  }

  // 3. Render Normal Unverified Button + OTP Modal
  return (
    <>
      <button
        type="button"
        onClick={() => handleSendOtp('whatsapp')}
        disabled={loading || !phone || phone.length < 10 || !email || !fullName}
        className="w-full py-3 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:bg-gray-700 disabled:text-gray-400 text-white font-bold text-sm transition-all shadow-lg shadow-pink-500/20 active:scale-95 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            Sending OTP...
          </>
        ) : (
          'Verify Contact'
        )}
      </button>

      {/* OTP Verification Modal Dialog */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop Overlay */}
          <div 
            onClick={handleCloseModal}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl z-10 text-white">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Verify Your Mobile Number
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Enter the 6-digit code sent to <span className="font-semibold text-white">{contact || normalizePhone(phone)}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="mb-4 flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-center gap-2 text-green-400 text-xs bg-green-500/10 p-2.5 rounded-xl border border-green-500/20">
                <CheckCircle size={14} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* OTP Form */}
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Enter 6-digit OTP
                  </label>
                  {timer > 0 && (
                    <span className="text-xs text-pink-400 font-mono">
                      00:{timer.toString().padStart(2, '0')}
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full py-3.5 px-4 bg-[#11161d] border border-white/10 text-white font-mono text-center tracking-[0.5em] text-2xl rounded-xl focus:outline-none focus:border-pink-500/50 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={verifying || otp.length !== 6}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {verifying ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Confirm & Verify'
                )}
              </button>

              {/* Resend Options */}
              <div className="pt-3 border-t border-white/10 mt-4">
                <p className="text-xs text-gray-400 mb-2.5 text-center">Didn't receive the OTP?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendOtp('whatsapp')}
                    disabled={loading || timer > 0}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <MessageCircle size={14} className="text-green-400" />
                    Resend WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendOtp('email')}
                    disabled={loading || timer > 0}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Mail size={14} className="text-blue-400" />
                    Send via Email
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default OtpVerification;
