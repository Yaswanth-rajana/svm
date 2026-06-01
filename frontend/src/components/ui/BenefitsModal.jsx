import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Gift, Sparkles, Award, ArrowRight } from 'lucide-react';

const BenefitsModal = ({ program = 'infrastructure' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-benefits-modal', handleOpen);
    
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('open-benefits-modal', handleOpen);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Sync modal open/closed state with external components (like WhatsApp float)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('benefits-modal-status', { detail: { isOpen } }));
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isCloud = program === 'cloud-computing';

  const keyTakeaways = isCloud ? [
    "Clear Cloud Computing Career Roadmap",
    "Step-by-Step Learning Path From 0 to Job Ready",
    "Understanding of Real Cloud Job Roles",
    "Practical Exposure Through Live Demo",
    "Interview & Job Readiness Insights",
    "Certificate of Participation"
  ] : [
    "Clear IT Infrastructure Career Roadmap",
    "Step-by-Step Learning Path From 0 to Job Ready",
    "Understanding of Real IT Job Roles",
    "Practical Exposure Through Live Demo",
    "Interview & Job Readiness Insights",
    "Certificate of Participation"
  ];

  const bonusTakeaways = isCloud ? [
    "Community Access",
    "Cloud Tools Starter Kit",
    "Cloud Career Roadmap PDF",
    "Live Resume Review Opportunity",
    "LinkedIn & Naukri Optimization Guide"
  ] : [
    "Community Access",
    "IT Tools Starter Kit",
    "IT Career Roadmap PDF",
    "Live Resume Review Opportunity",
    "LinkedIn & Naukri Optimization Guide"
  ];

  const handleCtaClick = () => {
    handleClose();
    // Wait a brief moment for the close animation to run before scrolling to the form
    setTimeout(() => {
      const element = document.getElementById('form-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // Focus the first input element (Full Name) to make it easy for user
        const input = element.querySelector('input');
        if (input) {
          input.focus({ preventScroll: true });
        }
      }
    }, 150);
  };

  // Responsive motion variants for premium animations
  const drawerVariants = {
    hidden: { 
      opacity: isMobile ? 1 : 0, 
      y: isMobile ? '100%' : 15,
      scale: isMobile ? 1 : 0.96 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1 
    },
    exit: { 
      opacity: isMobile ? 1 : 0, 
      y: isMobile ? '100%' : 10,
      scale: isMobile ? 1 : 0.96
    }
  };

  const drawerTransition = {
    type: isMobile ? 'spring' : 'tween',
    damping: isMobile ? 26 : 20,
    stiffness: isMobile ? 240 : 300,
    duration: isMobile ? 0.35 : 0.18,
    ease: isMobile ? undefined : 'easeOut'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center px-3 pb-0 pt-3 md:p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal / Bottom Drawer Container */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={drawerTransition}
            className="relative w-full md:max-w-4xl bg-[#0b0f14] border-t border-x border-white/10 md:border rounded-t-[2rem] rounded-b-none md:rounded-[2.5rem] shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden max-h-[85vh] md:max-h-[80vh] flex flex-col z-10 origin-bottom md:origin-center"
          >
            {/* Mobile Drag Indicator - Native feeling */}
            <div className="flex md:hidden justify-center pt-3.5 pb-1 flex-shrink-0">
              <div className="w-12 h-1 bg-white/20 rounded-full"></div>
            </div>

            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-pink-500/10 blur-[100px] rounded-full pointer-events-none -z-10 animate-pulse-slow"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

            {/* Header: Title and Close button */}
            <div className="relative px-4 pt-4 pb-2 md:px-10 md:pt-6 md:pb-4 flex-shrink-0 flex justify-between items-start">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 font-bold text-[9px] uppercase tracking-wider mb-1.5 md:mb-2">
                  <Sparkles size={9} />
                  <span>Exclusive Benefits</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-tight">
                  What You'll Gain From This Webinar
                </h2>
                <p className="text-gray-400 text-xs md:text-sm font-medium mt-0.5 md:mt-1">
                  A complete roadmap to start and grow your career in {isCloud ? 'Cloud Computing' : 'IT Infrastructure'}.
                </p>
              </div>

              {/* Close Button - Responsive size with comfortable touch target */}
              <button
                onClick={handleClose}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer flex-shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {/* Faint Divider Glow */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500/25 via-orange-500/20 to-transparent blur-[0.5px] flex-shrink-0"></div>

            {/* Scrollable Content Body */}
            <div className="overflow-y-auto px-5 py-5 md:px-10 md:py-8 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-stretch">
                
                {/* Column 1: Key Takeaways */}
                <div className="relative bg-[#11161d]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:border-pink-500/30 transition-all duration-300 flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
                  
                  <div className="flex items-center gap-2 mb-4 md:mb-5 relative z-10">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                      <Award className="text-pink-400" size={16} />
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-white tracking-wide">
                      Best Key Takeaways
                    </h3>
                  </div>

                  <div className="space-y-4 md:space-y-6 relative z-10 flex-1 flex flex-col justify-center">
                    {keyTakeaways.map((item, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        key={idx} 
                        className="flex items-start gap-3 group/item cursor-default"
                      >
                        <div className="mt-0.5 bg-green-500/10 p-0.5 rounded-full group-hover/item:bg-green-500/20 transition-colors">
                          <CheckCircle2 size={13} className="text-green-400 flex-shrink-0" />
                        </div>
                        <p className="text-gray-300 text-xs md:text-sm leading-relaxed group-hover/item:text-white transition-colors duration-200 font-medium">
                          {item}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Bonus Takeaways */}
                <div className="relative bg-[#11161d]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:border-orange-500/30 transition-all duration-300 flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
                  
                  <div className="flex items-center gap-2 mb-4 md:mb-5 relative z-10">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                      <Gift className="text-orange-400" size={16} />
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-white tracking-wide">
                      Bonus Takeaways
                    </h3>
                  </div>

                  <div className="space-y-4 md:space-y-6 relative z-10 flex-1 flex flex-col justify-center">
                    {bonusTakeaways.map((item, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (idx + keyTakeaways.length) * 0.03 }}
                        key={idx} 
                        className="flex items-start gap-3 group/item cursor-default"
                      >
                        <div className="mt-0.5 bg-orange-500/10 p-0.5 rounded-full group-hover/item:bg-orange-500/20 transition-colors">
                          <span className="text-xs flex-shrink-0">🎁</span>
                        </div>
                        <p className="text-gray-300 text-xs md:text-sm leading-relaxed group-hover/item:text-white transition-colors duration-200 font-medium">
                          {item}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Footer: Sticky Bottom CTA (Pinned to screen bottom on mobile) */}
            <div className="px-4 pt-3.5 pb-5 md:px-10 md:py-6 bg-[#0b0f14]/95 backdrop-blur-xl border-t border-white/10 flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3.5 w-full">
              <div className="text-center sm:text-left hidden sm:block">
                <p className="text-orange-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5 mb-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  Filling Fast
                </p>
                <p className="text-gray-400 text-xs md:text-sm font-medium">
                  Free access to all benefits upon registration.
                </p>
              </div>

              {/* Mobile Info line */}
              <div className="sm:hidden text-center flex items-center gap-1.5 mb-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                </span>
                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                  Free Access upon registration • Filling Fast
                </span>
              </div>

              <button
                onClick={handleCtaClick}
                className="w-full sm:w-auto relative overflow-hidden flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold py-3.5 px-6 md:px-8 rounded-xl shadow-[0_0_20px_rgba(255,77,141,0.3)] hover:shadow-[0_0_30px_rgba(255,100,50,0.5)] transition-all duration-300 hover:scale-[1.02] transform active:scale-98 whitespace-nowrap text-sm md:text-base group cursor-pointer"
              >
                {/* Premium Shine Sweep Animation */}
                <div className="absolute inset-y-0 -left-[100%] w-[50%] z-10 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none shine-element"></div>
                
                <span className="relative z-20 flex items-center gap-2">
                  <span>Reserve Your Spot</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <style>{`
        @keyframes shine-sweep {
          0% { left: -100%; }
          100% { left: 150%; }
        }
        .group:hover .shine-element {
          animation: shine-sweep 0.95s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>
    </AnimatePresence>
  );
};

export default BenefitsModal;
