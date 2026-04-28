import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import Container from '../layout/Container'
import Card from '../ui/Card'
import Input from '../ui/Input'
import AnimatedText from '../ui/AnimatedText'
import { content } from '../../data/content'
import { openLeadModal } from '../ui/LeadModal'

function HeroSection() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    degree: '',
    graduationYear: '',
    designation: '',
    company: '',
    phone: ''
  })

  const [headerTextIndex, setHeaderTextIndex] = useState(0)
  const headerTexts = [
    "Applications closing soon. Apply Now!",
    "Webinar limited to 60 selective seats"
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setHeaderTextIndex((prev) => (prev + 1) % headerTexts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'fullName') {
      if (/[^A-Za-z\s]/.test(value)) return
    }

    if (name === 'phone' || name === 'graduationYear') {
      if (/[^0-9]/.test(value)) return
      if (name === 'graduationYear' && value.length > 4) return
      if (name === 'phone' && value.length > 10) return
    }

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // handle form submission
    console.log('Form submitted:', formData)
  }

  const handleDownload = () => {
    openLeadModal('pdf')
  }
  
  return (
    <div id="hero" className="relative bg-gradient-to-r from-purple-900 via-black to-orange-900 text-white overflow-hidden min-h-screen flex items-center pt-20 pb-20 lg:pt-0 lg:pb-0">
      {/* Subtle blur effect */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      
      <Container>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 max-w-7xl mx-auto">
          {/* Left Content */}
          <div className="flex flex-col items-start text-left w-full lg:w-[55%]">
            
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight drop-shadow-2xl fade-in-up delay-1" style={{ textShadow: '0 8px 30px rgba(255,255,255,0.15)' }}>
              Start Your Career <br /> in IT Infrastructure
            </h1>
            
            <div className="flex flex-col items-start mb-10">
              <div 
                className="inline-flex items-center gap-[10px] px-[16px] py-[8px] rounded-full mt-[20px] mb-[12px] fade-in-up delay-2"
                style={{
                  border: '1px solid transparent',
                  background: 'linear-gradient(#0b0b12, #0b0b12) padding-box, linear-gradient(90deg, #ff4d8d, #ff7a18) border-box',
                  boxShadow: '0 0 12px rgba(255, 100, 150, 0.25)',
                }}
              >
                <span className="text-[14px] leading-none">⚡</span>
                <span 
                  style={{
                    color: '#ff7a9e',
                    fontWeight: 600,
                    fontSize: '14px',
                    letterSpacing: '0.3px',
                  }}
                >
                  AI-Proof Job Roles
                </span>
              </div>

              <p className="text-xl md:text-2xl text-gray-400 font-medium fade-in-up delay-3">
                Understand How IT Infrastructure Works
              </p>
            </div>
            
            <div className="fade-in-up delay-4">
              <button 
                onClick={handleDownload}
                className="group relative flex items-center gap-3 px-10 py-5 bg-white text-gray-900 rounded-2xl font-bold text-xl hover:bg-gray-100 transition-all duration-300 shadow-[0_10px_40px_rgba(255,255,255,0.1)] hover:shadow-[0_15px_50px_rgba(255,255,255,0.2)] active:scale-95"
              >
                <span>
                  <AnimatedText text="Download Pdf" />
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Right Form Card */}
          <div className="flex justify-center lg:justify-end w-full lg:w-[45%] lg:-mt-8 fade-in-up delay-5">
            <div className="w-full max-w-[435px]">
              <div className="bg-[#0b0f14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition duration-300 text-white" style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
                {/* Rotating Top Strip */}
                <div className="bg-gradient-to-r from-pink-500 to-orange-400 text-white text-center py-3 relative h-[48px] flex items-center justify-center overflow-hidden">
                  <p key={headerTextIndex} className="font-bold tracking-wide text-sm fade-in-up absolute">
                    {headerTexts[headerTextIndex]}
                  </p>
                </div>
                
                <form onSubmit={handleSubmit} className="pt-[72px] px-6 pb-6 space-y-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-400 ml-1">Full Name</label>
                      <Input 
                        placeholder="Elon Musk" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required 
                        className="!py-3 !px-3.5 !bg-white/5 border-white/10 !text-white h-[48px] focus:!border-pink-500/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-400 ml-1">Email</label>
                      <Input 
                        type="email"
                        placeholder="elon@spacex.com" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required 
                        className="!py-3 !px-3.5 !bg-white/5 border-white/10 !text-white h-[48px] focus:!border-pink-500/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-400 ml-1">Degree</label>
                      <Input 
                        as="select"
                        placeholder="Select one..." 
                        name="degree"
                        value={formData.degree}
                        onChange={handleChange}
                        options={["B.Tech / B.E.", "B.Sc", "BCA", "M.Tech", "MCA", "Other"]}
                        required 
                        className="!py-3 !px-3.5 !bg-white/5 border-white/10 !text-white h-[48px] focus:!border-pink-500/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-400 ml-1">Graduation Year</label>
                      <Input 
                        placeholder="2019" 
                        name="graduationYear"
                        type="text"
                        inputMode="numeric"
                        value={formData.graduationYear}
                        onChange={handleChange}
                        required 
                        className="!py-3 !px-3.5 !bg-white/5 border-white/10 !text-white h-[48px] focus:!border-pink-500/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-400 ml-1">Designation</label>
                      <Input 
                        placeholder="Data Analyst" 
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        required 
                        className="!py-3 !px-3.5 !bg-white/5 border-white/10 !text-white h-[48px] focus:!border-pink-500/50"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-400 ml-1">Company Name</label>
                      <Input 
                        placeholder="Amazon" 
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        required 
                        className="!py-3 !px-3.5 !bg-white/5 border-white/10 !text-white h-[48px] focus:!border-pink-500/50"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-400 ml-1">Phone Number</label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Input 
                          type="tel"
                          placeholder="6789123450" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required 
                          className="!py-3 !px-3.5 !bg-white/5 border-white/10 !text-white h-[48px] focus:!border-pink-500/50"
                        />
                      </div>
                      <button type="button" className="px-6 py-3 rounded-lg bg-pink-600 text-white hover:bg-pink-500 transition duration-200 whitespace-nowrap font-bold text-sm shadow-lg shadow-pink-500/20">
                        Send OTP
                      </button>
                    </div>
                  </div>
                  
                  <button type="submit" className="w-full !mt-6 bg-gradient-to-r from-pink-500 to-orange-500 text-white py-4 rounded-lg shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition duration-300 font-bold text-lg tracking-wide">
                    Submit Application
                  </button>
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