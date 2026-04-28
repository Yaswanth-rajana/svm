import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const openLeadModal = (type) => {
  window.dispatchEvent(new CustomEvent('open-lead-modal', { detail: { type } }));
};

const LeadModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [type, setType] = useState('pdf'); // 'pdf' or 'call'
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    const handleOpen = (e) => {
      setType(e.detail.type);
      setIsRendered(true);
      setIsSubmitted(false);
      setFormData({ fullName: '', email: '', phone: '' });
      
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

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsRendered(false);
      setIsSubmitted(false);
    }, 300); // Wait for transition to finish
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    setIsSubmitted(true);
    setTimeout(() => {
      closeModal();
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validation for phone number
    if (name === 'phone') {
      // Prevent 'e' and any non-numeric characters
      if (/[^0-9]/.test(value)) return;
      // Limit to 10 digits
      if (value.length > 10) return;
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
        className={`relative w-full max-w-md bg-[#0b0f14] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 transform ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{
          boxShadow: '0 0 40px rgba(249, 115, 22, 0.15)',
        }}
      >
        
        {/* Soft Glow Gradient Border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/50 to-orange-500/50 p-[1px] pointer-events-none">
          <div className="w-full h-full bg-[#0b0f14] rounded-2xl"></div>
        </div>

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
              <h3 className="text-2xl font-bold text-white mb-2">We'll reach out shortly 🚀</h3>
              <p className="text-gray-400">Thank you for your interest.</p>
            </div>
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
                    placeholder="+91 1234567890"
                    className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full mt-6 bg-gradient-to-r from-pink-500 to-orange-500 text-white py-3.5 rounded-xl font-bold shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  {ctaText}
                </button>
                
                <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  No spam • Instant access
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadModal;
