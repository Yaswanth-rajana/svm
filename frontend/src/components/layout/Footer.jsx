function Footer() {
  return (
    <footer className="bg-black text-gray-400 py-4 border-t border-gray-800 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-pink-500/5 blur-[80px] rounded-full pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-orange-500/5 blur-[80px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand Info */}
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-3">
              <img 
                src="/logo2.png" 
                alt="SmartMate Ventures Logo" 
                className="h-10 w-auto object-contain brightness-95"
              />
            </div>
            <p className="text-sm text-gray-500 max-w-sm font-medium">
              Building the next generation of IT Infrastructure and Cloud Engineers.
            </p>
          </div>

          {/* Social Media Links */}
          <div className="flex flex-col items-center md:items-end gap-3.5">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Connect With Us
            </span>
            <div className="flex items-center gap-4">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/smart.mate.ventures"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-pink-500/50 hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-orange-500/10 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                aria-label="Follow us on Facebook"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-facebook"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/smart.mate.ventures"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-pink-500/50 hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-orange-500/10 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                aria-label="Follow us on Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-instagram"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/smart-mate-venturess"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-pink-500/50 hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-orange-500/10 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                aria-label="Connect with us on LinkedIn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-linkedin"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;