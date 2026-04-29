export default function AnnouncementBar() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="relative z-10 flex justify-center items-center bg-gradient-to-r from-[#ff4d8d] to-[#ff7a18] text-white shadow-md w-full h-[36px] md:h-[40px] px-3 md:px-4 overflow-hidden whitespace-nowrap">
      <div className="text-[13px] md:text-[14px] font-medium flex items-center gap-1.5 md:gap-2">
        🔥 Live Webinar • Limited Seats • 
        <button 
          onClick={() => scrollToSection('webinar')}
          className="font-semibold underline underline-offset-2 hover:text-white/80 transition-colors cursor-pointer whitespace-nowrap"
        >
          Register Now →
        </button>
      </div>
    </div>
  )
}
