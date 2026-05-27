import { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Mail, Lock, CheckCircle, AlertCircle, RefreshCw, ArrowLeft, User, Key } from 'lucide-react';

const ClaimCertificate = () => {
  const [step, setStep] = useState(1); // 1: Info Form, 2: OTP Verification, 3: Success Screen
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [webinarCode, setWebinarCode] = useState('');
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Timer cooldown logic for OTP resend
  useEffect(() => {
    let interval;
    if (cooldown > 0) {
      interval = setInterval(() => setCooldown((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const showToast = (message, isError = false) => {
    if (isError) {
      setError(message);
      setSuccess('');
    } else {
      setSuccess(message);
      setError('');
      // Clear success notification after 7 seconds
      setTimeout(() => setSuccess(''), 7000);
    }
  };

  // Step 1: Send OTP (Also validates Email & Webinar Code on backend)
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();

    if (!fullName.trim()) {
      showToast('Please enter your full name for the certificate.', true);
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('Please enter a valid registered email address.', true);
      return;
    }
    if (!webinarCode.trim()) {
      showToast('Please enter the secret webinar code.', true);
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await axios.post(`${API_URL}/api/certificate/send-otp`, {
        email: email.trim(),
        webinarCode: webinarCode.trim()
      });

      showToast(response.data.message || 'OTP sent successfully!');
      setStep(2);
      setCooldown(30); // 30 seconds resend cooldown
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send OTP. Please check your credentials.', true);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Trigger PDF generation / emailing
  const handleVerifyAndGenerate = async (e) => {
    if (e) e.preventDefault();

    if (!otp || otp.length !== 6) {
      showToast('Please enter a valid 6-digit OTP.', true);
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await axios.post(`${API_URL}/api/certificate/verify-and-generate`, {
        fullName: fullName.trim(),
        email: email.trim(),
        webinarCode: webinarCode.trim(),
        otp: otp.trim()
      });

      showToast(response.data.message || 'Certificate generated and emailed!');
      setStep(3);
    } catch (err) {
      showToast(err.response?.data?.message || 'Verification failed. Please try again.', true);
    } finally {
      setLoading(false);
    }
  };

  // Restart / Reset flow
  const handleReset = () => {
    setStep(1);
    setOtp('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-pink-900/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-orange-950/15 blur-[100px] pointer-events-none"></div>

      {/* Main Glassmorphic Wrapper */}
      <div className="bg-[#11161d]/85 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl relative z-10">
        
        {/* Step 1 and 2 Header */}
        {step < 3 && (
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(236,72,153,0.3)] animate-pulse">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Certificate Portal</h1>
            <p className="text-gray-400 text-xs mt-1">Claim your webinar masterclass credentials</p>
          </div>
        )}

        {/* Global Banner Messages */}
        {error && (
          <div className="flex items-start gap-2.5 text-red-400 text-xs bg-red-500/10 p-3.5 rounded-xl border border-red-500/20 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2.5 text-green-400 text-xs bg-green-500/10 p-3.5 rounded-xl border border-green-500/20 mb-6">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* STEP 1: Form Inputs & Send OTP */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Full Name (For Certificate)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full py-3.5 pl-10 pr-4 bg-[#0b0f14]/80 border border-white/10 text-white rounded-xl focus:outline-none focus:border-pink-500/50 transition-all placeholder:text-gray-600 text-sm"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Registered Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3.5 pl-10 pr-4 bg-[#0b0f14]/80 border border-white/10 text-white rounded-xl focus:outline-none focus:border-pink-500/50 transition-all placeholder:text-gray-600 text-sm"
                />
              </div>
            </div>

            {/* Secret Webinar Code */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Secret Webinar Code
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. SMVINFRA2026"
                  value={webinarCode}
                  onChange={(e) => setWebinarCode(e.target.value.toUpperCase())}
                  className="w-full py-3.5 pl-10 pr-4 bg-[#0b0f14]/80 border border-white/10 text-white rounded-xl focus:outline-none focus:border-pink-500/50 transition-all placeholder:text-gray-600 text-sm tracking-wider"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-gradient-to-r from-pink-500 to-orange-500 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-xl shadow-orange-500/10 flex items-center justify-center gap-2 cursor-pointer mt-2 text-sm"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                'Request Verification OTP'
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification & Generating */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Field Lock Notice */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Locked Claim Details
              </p>
              <div className="text-xs text-gray-300 space-y-1 font-medium">
                <div>Name: <span className="text-white font-semibold">{fullName}</span></div>
                <div>Email: <span className="text-white font-semibold">{email}</span></div>
                <div>Webinar Code: <span className="text-white font-semibold">{webinarCode}</span></div>
              </div>
              <button 
                type="button" 
                onClick={handleReset}
                disabled={loading}
                className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 mt-2.5 cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change Details
              </button>
            </div>

            <form onSubmit={handleVerifyAndGenerate} className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Enter 6-Digit OTP
                  </label>
                  {cooldown > 0 ? (
                    <span className="text-xs font-mono text-pink-500 font-semibold">
                      Resend in {cooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp(null)}
                      className="text-xs text-pink-400 hover:underline font-semibold cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full py-3.5 pl-10 pr-4 bg-[#0b0f14]/80 border border-white/10 text-white font-mono text-center tracking-[0.4em] text-lg rounded-xl focus:outline-none focus:border-pink-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Verify & Generate Button */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-4 px-4 bg-gradient-to-r from-pink-500 to-orange-500 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-xl shadow-orange-500/10 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating Certificate...
                  </>
                ) : (
                  'Verify & Generate Certificate'
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: Success Screen */}
        {step === 3 && (
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-gradient-to-tr from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_35px_rgba(34,197,94,0.4)]">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-extrabold text-white mb-3">Claim Successful!</h1>
            
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm mb-6 max-w-sm mx-auto leading-relaxed">
              🎓 Certificate successfully sent to your email. Please check your Inbox/Spam folder.
            </div>

            <div className="text-xs text-gray-500 mb-8 border-t border-white/5 pt-4">
              Issued to: <span className="text-gray-300 font-semibold">{fullName}</span><br />
              Email: <span className="text-gray-300 font-semibold">{email}</span>
            </div>

            <a 
              href="/" 
              className="inline-block w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-4 rounded-xl font-bold shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
            >
              Return to Home
            </a>
          </div>
        )}

        {/* Footer Home link back for step 1 & 2 */}
        {step < 3 && (
          <div className="text-center mt-6">
            <a 
              href="/" 
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Return to Home
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimCertificate;
