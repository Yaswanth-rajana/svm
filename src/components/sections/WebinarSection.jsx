import React from 'react';
import { CheckCircle, Lock, Calendar, Users, ArrowRight } from 'lucide-react';
import { content } from '../../data/content';
import AnimatedText from '../ui/AnimatedText';

function WebinarSection() {
  const { webinar } = content;

  return (
    <section className="relative bg-[#0B0F14] py-24 lg:py-32 overflow-hidden" id="webinar">
      {/* Background Decorative Orbs & Radial Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-500/5 blur-[120px] rounded-full -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/5 blur-[120px] rounded-full -z-10"></div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[40%] h-[60%] bg-radial-gradient from-orange-500/10 to-transparent blur-[80px] -z-10"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-[48px]">
          
          {/* Left Side: Content Block */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <div className="relative inline-block mb-6 group cursor-default mt-2">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 blur opacity-50 group-hover:opacity-80 transition-opacity duration-300 animate-[pulse_3s_ease-in-out_infinite]"></div>
              <div className="relative flex items-center gap-2 px-5 py-2 rounded-full bg-[#11161d] border border-pink-500/50 group-hover:border-pink-400/80 transition-colors duration-300">
                <Calendar size={14} className="text-pink-400" />
                <span className="text-pink-300 font-bold text-xs uppercase tracking-[0.2em]">
                  Limited Seats Available
                </span>
              </div>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-5 tracking-tight">
              Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">FREE</span> <br className="hidden md:block" /> Live Webinar <span className="inline-block align-middle -translate-y-[2px]">🚀</span>
              <div className="w-20 h-1.5 bg-gradient-to-r from-pink-500 to-orange-400 mt-5 rounded-full hidden lg:block opacity-90"></div>
            </h2>
            
            <div className="space-y-4 mb-8">
              <p className="text-white/75 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                {webinar.subtitle}
              </p>
              {/* Refined Date & Time Line (Inline) */}
              <div className="inline-flex items-center justify-center lg:justify-start gap-4 text-orange-400 font-bold text-sm md:text-base tracking-wide py-2.5 px-5 rounded-xl bg-orange-500/10 border border-orange-500/20 shadow-[0_0_15px_rgba(255,165,0,0.1)]">
                {webinar.dateTime}
              </div>
            </div>

            {/* Bullet Points - Outcome-based */}
            <div className="space-y-3 mb-8 mt-5">
              {webinar.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-[10px] text-gray-200 text-lg justify-center lg:justify-start">
                  <CheckCircle size={22} className="text-pink-500 flex-shrink-0" />
                  <span className="font-semibold">{benefit}</span>
                </div>
              ))}
            </div>


          </div>

          {/* Right Side: CTA Card */}
          <div className="w-full lg:w-[460px]">
            <div className="relative group animate-float">
              {/* Refined Layered Glow */}
              <div className="absolute -inset-[1px] rounded-[2.5rem] bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-orange-500/20 blur-sm group-hover:opacity-100 transition duration-1000"></div>
              
              {/* Glassmorphism Card */}
              <div className="relative bg-[#11161d]/70 backdrop-blur-3xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] 
                            shadow-[0_0_30px_rgba(255,120,50,0.2),0_0_60px_rgba(255,120,50,0.08)] 
                            group-hover:shadow-[0_0_40px_rgba(255,120,50,0.3),0_0_80px_rgba(255,120,50,0.12)] 
                            transition-all duration-700 flex flex-col items-center text-center">
                
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-0">
                  <Users className="text-orange-400" size={24} />
                </div>

                <h3 className="text-2xl font-bold text-white mb-1 mt-3">
                  Reserve Your Spot
                </h3>
                <p className="text-gray-500 text-[13px] mb-6 font-medium">
                  Takes less than 30 seconds
                </p>

                {/* Real-time Urgency Tag */}
                <div className="mb-8 px-5 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 shadow-inner">
                  <p className="text-orange-400 text-[11px] font-bold uppercase tracking-[0.1em]">
                    🔥 {webinar.socialProof || "100+ Professionals already registered"}
                  </p>
                </div>

                {/* Primary Button */}
                <button className="w-full mx-auto group/btn relative bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold py-5 px-8 rounded-2xl 
                                 shadow-[0_0_20px_rgba(255,77,141,0.4)] 
                                 hover:shadow-[0_0_35px_rgba(255,100,50,0.6)] 
                                 hover:-translate-y-1 hover:scale-[1.02]
                                 animate-[ctaPulse_3s_ease-in-out_infinite]
                                 transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 group">
                  <span className="text-lg uppercase tracking-wider">
                    <AnimatedText text={webinar.cta} />
                  </span>
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>

                {/* Urgency & Trust */}
                <div className="mt-5 w-full flex flex-col items-center justify-center gap-2">
                  <p className="text-pink-300/85 drop-shadow-[0_0_8px_rgba(236,72,153,0.4)] text-[10px] font-bold uppercase tracking-widest">
                    👥 100+ professionals joined this week
                  </p>
                  <p className="text-orange-400/90 text-[10px] font-bold uppercase tracking-widest">
                    ⏳ Limited seats — filling fast
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 5s infinite ease-in-out;
        }
        .bg-radial-gradient {
          background: radial-gradient(circle, var(--tw-gradient-from), var(--tw-gradient-to));
        }
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255,77,141,0.4); }
          50% { box-shadow: 0 0 35px rgba(255,100,50,0.6); }
        }
      `}</style>
    </section>
  );
}

export default WebinarSection;