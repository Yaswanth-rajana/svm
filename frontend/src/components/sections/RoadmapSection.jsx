import { useRef, useState } from 'react';
import { programsContent } from '../../data/content';
import { ArrowRight, CheckCircle2, ChevronDown, Server, Database, Monitor, Settings, TrendingUp, Cloud } from 'lucide-react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';

function RoadmapSection({ program = 'infrastructure' }) {
  const data = programsContent[program] || programsContent.infrastructure;
  const { roadmap } = data;

  const scrollToWebinar = () => {
    const webinarElement = document.getElementById("webinar");
    if (webinarElement) {
      webinarElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const containerRef = useRef(null);
  const [showAll, setShowAll] = useState(false);
  const isSpecializedProgram = program !== 'it-infrastructure' && program !== 'infrastructure';
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end 70%"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const visibleSteps = (showAll || roadmap.steps.length <= 4) ? roadmap.steps : roadmap.steps.slice(0, 4);

  const getStepBadge = (step, index) => {
    return index + 1;
  };



  return (
    <section className="bg-white py-20 md:py-32 overflow-hidden text-gray-900" id="roadmap">
      <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-24 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight max-w-3xl mx-auto leading-tight">
            {roadmap.title}
          </h2>
          {Array.isArray(roadmap.subtitle) ? (
            <p className="text-gray-500 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
              {roadmap.subtitle[0]}
              <br className="hidden md:inline" />
              {roadmap.subtitle[1]}
            </p>
          ) : (
            <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              {roadmap.subtitle}
            </p>
          )}
        </div>

        {/* Timeline Container */}
        <div ref={containerRef} className="max-w-5xl mx-auto relative px-4">
          
          <div className="relative">
            {/* Background Track Line - HIDDEN ON MOBILE */}
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-6 bottom-6 w-1 bg-gray-100 rounded-full"></div>
            
            {/* Animated Progress Line - HIDDEN ON MOBILE */}
            <motion.div 
              style={{ scaleY, originY: 0 }}
              className={`hidden md:block absolute left-1/2 -translate-x-1/2 top-6 bottom-6 w-1 rounded-full z-10 ${
                isSpecializedProgram 
                  ? 'bg-gradient-to-b from-pink-500 via-purple-500 to-orange-500' 
                  : 'bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600'
              }`}
            />

            {/* Steps */}
            <div className="space-y-8 md:space-y-16 relative">
              <AnimatePresence mode="popLayout">
                {visibleSteps.map((step, index) => (
                  <motion.div 
                    key={index}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`flex flex-col md:flex-row gap-6 md:gap-8 items-center relative ${
                      index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    {/* Masking lines to stop at the first and last badge center */}
                    {index === 0 && (
                      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-1/2 w-4 bg-white z-[11] pointer-events-none" />
                    )}
                    {index === visibleSteps.length - 1 && (
                      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-1/2 bottom-0 w-4 bg-white z-[11] pointer-events-none" />
                    )}

                    {/* Floating Badge - DESKTOP ONLY */}
                    <div className="hidden md:flex absolute md:left-1/2 md:-translate-x-1/2 flex-shrink-0 z-20">
                      <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center font-bold text-gray-900 shadow-xl border-2 group-hover:scale-110 transition-transform duration-300 ${
                        isSpecializedProgram ? 'border-pink-500' : 'border-blue-600'
                      }`}>
                        {getStepBadge(step, index)}
                      </div>
                    </div>

                    {/* Card Column */}
                    <div className="w-full md:w-[45%]">
                      <motion.div 
                        whileTap={{ scale: 0.98 }}
                        className={`bg-white rounded-[2rem] px-5 py-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all duration-500 group relative overflow-hidden cursor-pointer ${
                          isSpecializedProgram ? 'hover:border-pink-500/50' : 'hover:border-blue-600/50'
                        }`}
                      >
                        {/* Hover Gradient Background */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${
                          isSpecializedProgram 
                            ? 'from-pink-50/40 to-orange-50/40' 
                            : 'from-blue-50/40 to-purple-50/40'
                        }`} />
                        
                        <div className="relative z-10">
                          {/* Title & Duration Pill */}
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                            <div className="flex items-center gap-4">
                              {/* Step Number Badge - MOBILE ONLY */}
                              <div className={`flex md:hidden w-7 h-7 rounded-full items-center justify-center text-[13px] font-bold flex-shrink-0 shadow-lg text-white ${
                                isSpecializedProgram 
                                  ? 'bg-pink-500 shadow-pink-500/20' 
                                  : 'bg-blue-600 shadow-blue-500/20'
                              }`}>
                                {getStepBadge(step, index)}
                              </div>
                              <h3 className={`text-[18px] md:text-xl font-bold transition-colors leading-tight text-gray-900 ${
                                isSpecializedProgram 
                                  ? 'group-hover:text-pink-600' 
                                  : 'group-hover:text-blue-600'
                              }`}>
                                {step.phase ? `${step.phase} — ` : ''}{step.title}
                              </h3>
                            </div>
                            {step.duration && (
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap uppercase tracking-wider ${
                                isSpecializedProgram 
                                  ? 'bg-pink-50 text-pink-700' 
                                  : 'bg-blue-50 text-blue-700'
                              }`}>
                                {step.duration}
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
                            {step.description}
                          </p>

                          {/* Skill Tags */}
                          <div className="flex flex-wrap gap-3">
                            {step.tags.map((tag, tIdx) => (
                              <div key={tIdx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 group-hover:bg-white text-gray-600 text-[10px] md:text-[11px] font-semibold border border-gray-100 transition-colors">
                                <CheckCircle2 size={12} className={isSpecializedProgram ? 'text-pink-500' : 'text-blue-500'} />
                                {tag}
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Empty Space for Alternating Layout */}
                    <div className="hidden md:block md:w-[45%]"></div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>



          {/* Show More Button & Mid-Section CTA */}
          <div className="mt-16 text-center space-y-8 relative z-20">
            {!showAll && roadmap.steps.length > 4 && (
              <>
                <button 
                  onClick={() => setShowAll(true)}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all shadow-lg group"
                >
                  <span>View Full Roadmap</span>
                  <ChevronDown size={20} className="group-hover:translate-y-1 transition-transform" />
                </button>
                
                <div className="pt-8">
                  <motion.button 
                    onClick={scrollToWebinar}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 font-bold flex items-center justify-center gap-3 mx-auto hover:bg-blue-100 transition-all"
                  >
                    <span>Don't wait! Book your free spot now</span>
                    <ArrowRight size={20} />
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Final CTA (Always visible or only at the very end) */}
        <AnimatePresence>
          {(showAll || roadmap.steps.length <= 4) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-20 md:mt-28"
            >
              <motion.button 
                onClick={scrollToWebinar}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-12 py-5 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 mx-auto shadow-2xl ${
                  isSpecializedProgram 
                    ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:opacity-90 shadow-pink-500/20' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-blue-500/25 hover:shadow-blue-500/40'
                }`}
              >
                <span>Start your journey with us</span>
                <ArrowRight size={24} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Required CSS for Shimmer Animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite linear;
        }
      `}</style>
    </section>
  );
}

export default RoadmapSection;