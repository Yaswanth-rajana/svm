import { useState } from 'react'
import Container from '../layout/Container'
import Input from '../ui/Input'
import AnimatedText from '../ui/AnimatedText'
import { content } from '../../data/content'
import { openLeadModal } from '../ui/LeadModal'

function HeroSection() {
  const { hero } = content;
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    workingProfile: '',
    experience: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'fullName') {
      if (/[^A-Za-z\s]/.test(value)) return
    }

    if (name === 'phone') {
      if (/[^0-9]/.test(value)) return
      if (value.length > 10) return
    }

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  const handleDownload = () => {
    openLeadModal('pdf')
  }

  return (
    <div id="hero-section" className="relative bg-[#050505] text-white flex items-center pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden min-h-screen">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-900/20 blur-[120px] rounded-full"></div>
      </div>

      <Container>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 pt-0 lg:pt-0 pb-6 lg:pb-10">
          {/* Left Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-[65%]">
            
            <h1 className="text-[40px] sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
              <span className="block">Start Your Career</span>
              <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent block lg:inline">in IT Infrastructure</span>
            </h1>

            {/* AI-Proof Tag */}
            <div
              className="inline-flex items-center gap-2 px-[14px] py-[6px] rounded-full mb-6 border border-[rgba(255,0,100,0.4)] bg-[rgba(255,0,100,0.1)] shadow-[0_0_20px_rgba(255,0,100,0.2)] hover:shadow-[0_0_30px_rgba(255,0,100,0.3)] transition-all duration-300"
            >
              <span className="text-sm font-bold text-[#ff0064] tracking-wide flex items-center gap-1.5">
                ⚡ {hero.badge}
              </span>
            </div>

            <p className="text-lg md:text-xl text-gray-400 font-medium mb-4 lg:mb-8 max-w-xl leading-relaxed">
              {hero.subtitle}
            </p>

            {/* Mobile-only Centered Arrow */}
            <div className="lg:hidden flex justify-center mb-4">
              <span className="arrow-down">↓</span>
            </div>

            <div className="mt-1 lg:mt-4 relative">
              {/* Refined Premium SVG Arrow */}
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

              <button
                onClick={handleDownload}
                className="group relative flex items-center gap-3 px-10 py-5 bg-white text-gray-900 rounded-2xl font-bold text-xl hover:bg-gray-100 transition-all duration-300 shadow-[0_10px_40px_rgba(255,255,255,0.1)] hover:shadow-[0_15px_50px_rgba(255,255,255,0.2)] active:scale-95"
              >
                <span>
                  <AnimatedText text={hero.ctaPrimary} />
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Form Card */}
          <div id="form-section" className="flex justify-center lg:justify-end w-full lg:w-[45%] lg:translate-y-12">
            <div className="w-full max-w-[480px]">
              <div className="bg-[#0b0f14] border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative" style={{ boxShadow: '0 30px 100px rgba(0,0,0,0.8)' }}>
                {/* Top Strip */}
                <div className="bg-gradient-to-r from-pink-600 to-orange-500 text-white text-center py-4">
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
                        className="!py-3.5 !px-4 !bg-white/5 border-white/10 !text-white rounded-xl focus:!border-pink-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number</label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Input
                          type="tel"
                          placeholder="6789123450"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="!py-3.5 !px-4 !bg-white/5 border-white/10 !text-white rounded-xl focus:!border-pink-500/50 transition-all"
                        />
                      </div>
                      <button type="button" className="px-5 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm transition-all shadow-lg shadow-pink-500/20 active:scale-95">
                        Verify Number
                      </button>
                    </div>
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
                    <Input
                      as="select"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      options={["Fresher", "1–3 years", "3–5 years", "5+ years"]}
                      required
                      className="!py-3.5 !px-4 !bg-white/5 border-white/10 !text-white rounded-xl focus:!border-pink-500/50 transition-all"
                    />
                  </div>

                  <div className="pt-2">
                    <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-4 rounded-xl shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-extrabold text-lg tracking-wide">
                      Reserve Your Spot
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
              </div>
            </div>
          </div>
        </div>
      </Container>

    </div>
  )
}

export default HeroSection