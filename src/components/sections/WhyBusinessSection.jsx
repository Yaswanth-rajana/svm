import React from 'react';
import { TrendingUp, Shield, Zap, Activity } from 'lucide-react';
import { content } from '../../data/content';

const iconMap = {
  Scalability: TrendingUp,
  Security: Shield,
  "Cost Efficiency": Zap,
  "Business Continuity": Activity
};

function WhyBusinessSection() {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-24 lg:py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-24">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight max-w-[700px] mx-auto leading-tight">
            {content.whyBusiness.title}
          </h2>
          {/* <div className="w-20 h-1.5 bg-gradient-to-r from-pink-500 to-orange-400 mx-auto mt-8 rounded-full shadow-[0_0_10px_rgba(255,78,205,0.2)] animate-pulse-slow"></div> */}
        </div>

        {/* Reasons Grid with Staggered Animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {content.whyBusiness.reasons.map((reason, index) => {
            const Icon = iconMap[reason.title];

            return (
              <div 
                key={index} 
                className="group p-8 bg-white border border-gray-100 rounded-3xl transition-all duration-500 flex flex-col items-center text-center cursor-pointer animate-fade-up
                           shadow-[0_4px_20px_rgba(0,0,0,0.03)] 
                           hover:shadow-[0_20px_40px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,122,24,0.2)] 
                           hover:-translate-y-2.5 active:scale-[0.98]"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Icon Wrapper - Precise Consistency */}
                <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-pink-50 to-orange-50 group-hover:from-pink-500 group-hover:to-orange-500 transition-all duration-500 mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-3">
                  {Icon && <Icon size={28} className="text-pink-500 group-hover:text-white transition-colors duration-500" />}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">
                  {reason.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 text-sm leading-relaxed max-w-[200px] font-medium">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Required CSS for Premium Animations */}
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-up {
          opacity: 0;
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.95); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite ease-in-out;
        }
      `}</style>
    </section>
  );
}

export default WhyBusinessSection;