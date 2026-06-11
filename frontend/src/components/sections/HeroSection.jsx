import { useState, useEffect, useRef } from 'react'
import Container from '../layout/Container'
import Input from '../ui/Input'
import AnimatedText from '../ui/AnimatedText'
import { programsContent } from '../../data/content'
import { openLeadModal } from '../../utils/modalEvents'
import OtpVerification from '../ui/OtpVerification'
import { handleRazorpayPayment } from '../../utils/payment'
import { normalizePhone } from '../../utils/phone'
import BenefitsLink from '../ui/BenefitsLink'

const EXPERIENCE_OPTIONS = ['Fresher', '1–3 years', '3–5 years', '5+ years'];

function ExperienceDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between py-3.5 px-4 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:border-pink-500/50 transition-all text-sm"
      >
        <span className={value ? 'text-white' : 'text-gray-500'}>
          {value || 'Select experience'}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Options */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-[#11161d] border border-white/10 rounded-xl overflow-hidden shadow-xl shadow-black/50">
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

function HeroSection({ program }) {
  const isBypass = import.meta.env.VITE_DISABLE_OTP_VALIDATION === 'true';
  const data = programsContent[program] || programsContent.infrastructure;
  const { hero } = data;
  const isSpecializedProgram = program !== 'it-infrastructure' && program !== 'infrastructure';
  const badgeText = hero.badge;
  const subtitleText = hero.subtitle;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    workingProfile: '',
    experience: ''
  })

  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [loadingAction, setLoadingAction] = useState(""); // "submit"
  const [resetKey, setResetKey] = useState(0);



  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'phone') {
      // Allow only digits
      if (/[^0-9]/.test(value)) return;
      // Limit to 10 chars
      if (value.length > 10) return;
      if (isPhoneVerified) setIsPhoneVerified(false);
    }
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length < 10) {
      alert("Please enter a valid phone number.");
      return;
    }
    if (!isPhoneVerified) {
      alert("Please verify your phone number first.");
      return;
    }
    setLoadingAction("submit");

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const payload = {
        name: formData.fullName,
        email: formData.email,
        phone: normalizePhone(formData.phone),
        source: 'webinar',
        workingProfile: formData.workingProfile,
        experience: formData.experience,
        program: program === 'infrastructure' ? 'it-infrastructure' : (program || 'it-infrastructure')
      };

      console.log("Submitting lead from HeroSection:", payload);

      const response = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error(`Unexpected server response format (HTTP ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data.message || `Server error: HTTP ${response.status}`);
      }

      if (data.success) {
        const lead = data.data;

        // 💳 Razorpay Integration for Webinar
        handleRazorpayPayment({
          leadData: lead,
          formData: formData,
          amount: data.price,
          onSuccess: () => {
            // Open the success popup
            openLeadModal('webinar', true);
            // Clear the hero form
            setFormData({ fullName: '', email: '', phone: '', workingProfile: '', experience: '' });
            setIsPhoneVerified(false);
            setResetKey(prev => prev + 1);
            setLoadingAction("");
          },
          onFailure: () => {
            setLoadingAction("");
          },
          onModalClose: () => {
            setLoadingAction("");
          }
        });
      } else {
        alert(data.message || "Something went wrong. Please try again.");
        setLoadingAction("");
      }
    } catch (error) {
      console.error("Submission error:", error);
      if (error.name === 'AbortError') {
        alert("Request timed out. Please check your connection and try again.");
      } else {
        alert(error.message || "Could not connect to the server. Please try again later.");
      }
      setLoadingAction("");
    }
  };

  const handleDownload = () => {
    openLeadModal('pdf')
  }

  return (
    <div id="hero-section" className="relative bg-[#050505] text-white flex items-center pt-12 pb-24 lg:pt-20 lg:pb-32 min-h-screen">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-900/20 blur-[120px] rounded-full"></div>
      </div>

      <Container pxClasses={program === 'devops-engineering' ? "px-6 md:px-12 lg:px-12" : "px-6 md:px-16 lg:px-24"}>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 pt-0 lg:pt-0 pb-6 lg:pb-10">
          {/* Left Content */}
          <div className={`flex flex-col items-center lg:items-start text-center lg:text-left w-full ${hero.leftWidth || 'lg:w-[65%]'}`}>

            <h1 className={`${hero.titleSize || (isSpecializedProgram ? 'text-[32px] sm:text-4xl md:text-5xl lg:text-6xl' : 'text-[40px] sm:text-5xl md:text-6xl lg:text-7xl')} font-extrabold text-white leading-[1.1] mb-6 tracking-tight`}>
              <span className={`block ${hero.noWrap ? 'md:whitespace-nowrap' : ''}`}>{hero.titlePart1} </span>
              <span className={`bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent block ${hero.noWrap ? 'md:whitespace-nowrap' : 'sm:inline'}`}>{hero.titlePart2}</span>
              {hero.titlePart3 && (
                <span className={`bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent block ${hero.noWrap ? 'md:whitespace-nowrap' : 'sm:inline'}`}>{hero.titlePart3}</span>
              )}
            </h1>

            {/* AI-Proof Tag */}
            <div
              className="inline-flex items-center gap-2 px-[14px] py-[6px] rounded-full mb-6 border border-[rgba(255,0,100,0.4)] bg-[rgba(255,0,100,0.1)] shadow-[0_0_20px_rgba(255,0,100,0.2)] hover:shadow-[0_0_30px_rgba(255,0,100,0.3)] transition-all duration-300"
            >
              <span className="text-sm font-bold text-[#ff0064] tracking-wide flex items-center gap-1.5">
                ⚡ {badgeText}
              </span>
            </div>

            <p className="text-lg md:text-xl text-gray-400 font-medium mb-4 lg:mb-8 max-w-2xl leading-relaxed">
              {subtitleText}
            </p>

            {/* Mobile-only Centered Arrow */}
            {!isSpecializedProgram && (
              <div className="lg:hidden flex justify-center mb-4">
                <span className="arrow-down">↓</span>
              </div>
            )}

            <div className="mt-1 lg:mt-4 relative">
              {/* Refined Premium SVG Arrow */}
              {!isSpecializedProgram && (
                <div className="cta-hint hidden lg:block absolute -top-14 -right-32 pointer-events-none z-20 rotate-[-15deg]">
                  <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-bounce-slow">
                    <path
                      d="M160,10 C160,60 80,100 20,80"
                      stroke="url(#arrowGradientFlipped)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_10px_rgba(236,72,153,0.4)]"
                    />
                    <path
                      d="M35,68 L20,80 L38,92"
                      stroke="url(#arrowGradientFlipped)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="drop-shadow-[0_0_10px_rgba(236,72,153,0.4)]"
                    />
                    <defs>
                      <linearGradient id="arrowGradientFlipped" x1="100%" y1="0%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              )}

              <button
                onClick={handleDownload}
                className="group relative flex items-center gap-3 px-10 py-5 bg-white text-gray-900 rounded-2xl font-bold text-xl hover:bg-gray-100 transition-all duration-300 shadow-[0_10px_40px_rgba(255,255,255,0.1)] hover:shadow-[0_15px_50px_rgba(255,255,255,0.2)] active:scale-95 cursor-pointer"
              >
                <span>
                  <AnimatedText text={hero.ctaPrimary} />
                </span>
                {!isSpecializedProgram && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Right Form Card */}
          <div id="form-section" className={`flex justify-center lg:justify-end w-full ${hero.rightWidth || 'lg:w-[45%]'} lg:translate-y-12`}>
            <div className="w-full max-w-[480px]">
              <div className="bg-[#0b0f14] border border-white/10 rounded-3xl shadow-2xl overflow-visible relative" style={{ boxShadow: '0 30px 100px rgba(0,0,0,0.8)' }}>
                  {/* Top Strip */}
                <div className="bg-gradient-to-r from-pink-600 to-orange-500 text-white text-center py-4 rounded-t-3xl">
                  <p className="font-bold tracking-wide text-sm">
                    {hero.formHeader}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                      <Input
                        placeholder="Elon Musk"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="!py-3.5 !px-4 !bg-white/5 border-white/10 !text-white rounded-xl focus:!border-pink-500/50 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                      <Input
                        type="email"
                        placeholder="elon@spacex.com"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isPhoneVerified && !isBypass}
                        className={`!py-3.5 !px-4 !bg-white/5 border-white/10 !text-white rounded-xl transition-all ${isPhoneVerified && !isBypass ? 'opacity-50' : 'focus:!border-pink-500/50'}`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number</label>
                    <Input
                      type="tel"
                      placeholder="6789123450"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      maxLength={10}
                      disabled={isPhoneVerified && !isBypass}
                      className={`!py-3.5 !px-4 !bg-white/5 border-white/10 !text-white rounded-xl transition-all ${isPhoneVerified && !isBypass ? 'opacity-50' : 'focus:!border-pink-500/50'}`}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Verification</label>
                    <OtpVerification
                      key={`otp-hero-${resetKey}`}
                      phone={formData.phone}
                      email={formData.email}
                      fullName={formData.fullName}
                      onVerified={() => setIsPhoneVerified(true)}
                      onReset={() => setIsPhoneVerified(false)}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Working Profile</label>
                    <Input
                      placeholder="e.g. Software Engineer, Student, etc."
                      name="workingProfile"
                      value={formData.workingProfile}
                      onChange={handleChange}
                      required
                      className="!py-3.5 !px-4 !bg-white/5 border-white/10 !text-white rounded-xl focus:!border-pink-500/50 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Years of Experience</label>
                    <ExperienceDropdown
                      value={formData.experience}
                      onChange={(val) => setFormData(prev => ({ ...prev, experience: val }))}
                    />
                  </div>

                  <BenefitsLink />

                  <div className="pt-2">
                    <button type="submit" disabled={!isPhoneVerified || loadingAction === "submit"} className={`w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-4 rounded-xl shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-extrabold text-lg tracking-wide ${(!isPhoneVerified || loadingAction === "submit") ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {loadingAction === "submit" ? "Reserving..." : "Reserve Your Spot"}
                    </button>
                    <p className="text-center text-xs font-bold text-orange-400 mt-4 flex items-center justify-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                      </span>
                      ⚡ Filling fast — Only few seats left
                    </p>
                  </div>
                </form>

                {/* Claim Certificate CTA */}
                {/* <div className="px-8 pb-8 text-center">
                  <div className="w-full h-px bg-white/10 my-5" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">
                      Already attended the webinar?
                    </p>
                    <Link
                      to="/claim-certificate"
                      className="group inline-flex items-center gap-1.5 text-sm font-semibold text-gray-300 hover:text-white transition-all duration-300"
                    >
                      <span className="inline-block transition-transform duration-300 group-hover:scale-110">
                        🎓
                      </span>
                      <span className="text-gray-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-orange-500 transition-all duration-300">
                        Claim your participation certificate
                      </span>
                      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 text-orange-400">
                        →
                      </span>
                    </Link>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </Container>

    </div>
  )
}

export default HeroSection