import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Input from './Input';
import OtpVerification from './OtpVerification';
import { handleRazorpayPayment } from '../../utils/payment';
import { normalizePhone } from '../../utils/phone';
import BenefitsLink from './BenefitsLink';

const EXPERIENCE_OPTIONS = ['Fresher', '1–3 years', '3–5 years', '5+ years'];

function ExperienceDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between py-3 px-4 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-pink-500/50 transition-all text-sm"
      >
        <span className={value ? 'text-white' : 'text-gray-500'}>
          {value || 'Select experience'}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-[200] w-full mt-1 bg-[#11161d] border border-white/10 rounded-xl overflow-hidden shadow-xl shadow-black/50">
          {EXPERIENCE_OPTIONS.map((opt) => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`px-4 py-3 text-sm cursor-pointer transition-colors
                ${value === opt
                  ? 'bg-gradient-to-r from-pink-500/20 to-orange-500/20 text-white font-bold border-l-2 border-pink-500'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


const LeadModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [type, setType] = useState('pdf'); // 'pdf' or 'call'
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    workingProfile: '',
    experience: ''
  });
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  useEffect(() => {
    const handleOpen = (e) => {
      setType(e.detail.type);
      setIsRendered(true);
      setIsSubmitted(e.detail.isSuccess || false);
      setFormData({ fullName: '', email: '', phone: '', workingProfile: '', experience: '' });
      setIsPhoneVerified(false);
      setResetKey(prev => prev + 1);

      // Request animation frame to ensure the DOM is updated before applying transitions
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsOpen(true);
        });
      });
    };
    window.addEventListener('open-lead-modal', handleOpen);
    return () => window.removeEventListener('open-lead-modal', handleOpen);
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsRendered(false);
      setIsSubmitted(false);
    }, 300); // Wait for transition to finish
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length < 10) {
      alert("Please enter a valid phone number.");
      return;
    }
    
    if (type === 'webinar' && !isPhoneVerified) {
      alert("Please verify your contact before submitting.");
      return;
    }

    try {
      const isCallRequest = type === 'call';
      const endpoint = isCallRequest ? '/api/request-call' : '/api/leads';
      
      const payload = isCallRequest 
        ? {
            name: formData.fullName,
            email: formData.email,
            phone: normalizePhone(formData.phone)
          }
        : {
            name: formData.fullName,
            email: formData.email,
            phone: normalizePhone(formData.phone),
            source: type === 'webinar' ? 'webinar' : 'brochure',
            workingProfile: formData.workingProfile,
            experience: formData.experience
          };

      console.log("Sending payload:", payload);

      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        const lead = data.data;

        // 💳 Razorpay Integration for Webinar
        if (type === 'webinar') {
          setIsPaymentLoading(true);
          handleRazorpayPayment({
            leadData: lead,
            formData: formData,
            onSuccess: () => {
              setIsSubmitted(true);
              setIsPaymentLoading(false);
              setTimeout(() => closeModal(), 4000);
            },
            onFailure: () => {
              setIsPaymentLoading(false);
            },
            onModalClose: () => {
              setIsPaymentLoading(false);
            }
          });
          return;
        }

        // Regular success flow for non-webinar types
        setIsSubmitted(true);

        // If it's a PDF request, trigger the download
        if (type === 'pdf') {
          const link = document.createElement('a');
          link.href = '/brochure.pdf'; // Make sure this file exists in public/
          link.download = 'IT_Infrastructure_Brochure.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        setTimeout(() => {
          closeModal();
        }, 4000);
      } else {
        alert(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Could not connect to the server. Please try again later.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validation for phone number
    if (name === 'phone') {
      // Allow only digits
      if (/[^0-9]/.test(value)) return;
      // Limit to 10 chars
      if (value.length > 10) return;
      if (isPhoneVerified) setIsPhoneVerified(false);
    }

    // Validation for full name (optional, but good for consistency)
    if (name === 'fullName') {
      if (/[^A-Za-z\s]/.test(value)) return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isRendered) return null;

  const microcopy = type === 'pdf'
    ? "Enter your details to download the brochure instantly"
    : "Our team will contact you within 24 hours";

  const ctaText = type === 'pdf' ? "Get Access" : "Request Call";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={closeModal}
      ></div>

      {/* Modal Content */}
      <div
        className={`relative w-full max-w-[500px] bg-[#0b0f14] rounded-[2.5rem] overflow-visible shadow-2xl transition-all duration-300 transform ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{
          boxShadow: '0 0 60px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Top Header Strip - Only for Webinar (Hide if submitted) */}
        {type === 'webinar' && !isSubmitted && (
          <div className="bg-gradient-to-r from-pink-600 to-orange-500 text-white text-center py-3.5 rounded-t-[2.5rem]">
            <p className="font-bold tracking-wide text-sm">
              Limited seats — Register Now
            </p>
          </div>
        )}

        {/* Glow Border */}
        <div className="absolute inset-0 rounded-[2.5rem] border border-white/10 pointer-events-none"></div>

        <div className="relative z-10 p-8">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {isSubmitted ? (
            <div className="text-center py-10 transition-opacity duration-500">
              <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {type === 'call' 
                  ? "We'll reach out shortly 🚀" 
                  : type === 'pdf'
                  ? "Brochure downloaded successfully 📚"
                  : "You have registered for the webinar successfully 🚀"}
              </h3>
              <p className="text-gray-400">
                {type === 'call'
                  ? "Our team will contact you within 24 hours."
                  : type === 'pdf'
                  ? "Your download should start automatically."
                  : "Check your email for joining details."}
              </p>
            </div>
          ) : type === 'webinar' ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                    <Input
                      placeholder="Elon Musk"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="!py-3 !px-4 !bg-white/5 border-white/10 !text-white rounded-xl focus:!border-pink-500/50 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email</label>
                    <Input
                      type="email"
                      placeholder="elon@spacex.com"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isPhoneVerified}
                      className={`!py-3 !px-4 !bg-white/5 border-white/10 !text-white rounded-xl transition-all text-sm ${isPhoneVerified ? 'opacity-50' : 'focus:!border-pink-500/50'}`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        type="tel"
                        placeholder="6789123450"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        maxLength={10}
                        disabled={isPhoneVerified}
                        className={`!py-3 !px-4 !bg-white/5 border-white/10 !text-white rounded-xl transition-all text-sm ${isPhoneVerified ? 'opacity-50' : 'focus:!border-pink-500/50'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Verification</label>
                  <OtpVerification 
                    key={`otp-modal-${resetKey}`}
                    phone={formData.phone} 
                    email={formData.email} 
                    onVerified={() => setIsPhoneVerified(true)}
                    onReset={() => setIsPhoneVerified(false)}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Working Profile</label>
                  <Input
                    placeholder="e.g. Software Engineer, Student, etc."
                    name="workingProfile"
                    value={formData.workingProfile}
                    onChange={handleChange}
                    required
                    className="!py-3 !px-4 !bg-white/5 border-white/10 !text-white rounded-xl focus:!border-pink-500/50 transition-all text-sm"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Years of Experience</label>
                  <ExperienceDropdown
                    value={formData.experience}
                    onChange={(val) => setFormData(prev => ({ ...prev, experience: val }))}
                  />
                </div>

                <BenefitsLink />

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={!isPhoneVerified || isPaymentLoading}
                    className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-4 rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-extrabold text-lg tracking-wide disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isPaymentLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : "Reserve Your Spot"}
                  </button>
                  <p className="text-center text-[11px] font-bold text-orange-400 mt-4 flex items-center justify-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    ⚡ Filling fast — Only few seats left
                  </p>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                {type === 'pdf' ? 'Download Brochure' : 'Request a Call'}
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                {microcopy}
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-gray-400 ml-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-gray-400 ml-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-gray-400 ml-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    placeholder="1234567890"
                    className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all"
                  />
                </div>

                {type === 'call' && (
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Verification</label>
                    <OtpVerification 
                      key={`otp-modal-simple-${resetKey}`}
                      phone={formData.phone} 
                      email={formData.email} 
                      onVerified={() => setIsPhoneVerified(true)}
                      onReset={() => setIsPhoneVerified(false)}
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={type === 'call' && !isPhoneVerified}
                  className="w-full mt-6 bg-gradient-to-r from-pink-500 to-orange-500 text-white py-3.5 rounded-xl font-bold shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {ctaText}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadModal;