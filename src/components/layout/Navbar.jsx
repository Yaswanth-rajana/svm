import { useState } from 'react'
import AnimatedText from '../ui/AnimatedText'
import { openLeadModal } from '../ui/LeadModal'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-black border-b border-gray-800 shadow-md relative z-20 w-full">
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 py-3">
        <div className="flex justify-between items-center gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer flex-shrink-0" onClick={() => scrollToSection('hero')}>
            <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-base md:text-2xl font-bold text-white tracking-tight uppercase">SMART MATE VENTURES</span>
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Call Button */}
            <a 
              href="tel:+919876543210"
              className="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-800 hover:border-gray-600 text-gray-300 hover:text-white transition-all duration-300 group flex-shrink-0"
              aria-label="Call us now"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </a>

            {/* Request a Call Button */}
            <button 
              onClick={() => openLeadModal('call')}
              className="relative p-[1.5px] rounded-full bg-gradient-to-r from-pink-500 to-orange-500 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all duration-300 group flex-shrink-0"
            >
              <div className="px-4 md:px-7 py-2 md:py-2.5 bg-black rounded-full h-full w-full flex items-center justify-center transition-colors group-hover:bg-opacity-90">
                <span className="text-white text-xs md:text-base font-bold tracking-wide">
                  <AnimatedText text="Request a Call" />
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar