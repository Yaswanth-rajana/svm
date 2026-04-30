import React from 'react';
import { 
  Monitor, 
  Cloud, 
  Package, 
  ShieldCheck, 
  Network, 
  Cpu, 
  Database, 
  Wrench 
} from 'lucide-react';
import { content } from '../../data/content';

const iconMap = {
  Hardware: Monitor,
  Cloud: Cloud,
  Software: Package,
  Security: ShieldCheck,
  Networks: Network,
  IaaS: Cpu,
  "Data Centers": Database,
  ITSM: Wrench
};

function ComponentsSection() {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-24 lg:py-28">
      <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-24">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            {content.components.title}
          </h2>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {content.components.subtitle}
          </p>
          {/* Animated Divider */}
          <div className="relative w-24 h-1.5 mx-auto mt-8 overflow-hidden rounded-full bg-gray-100">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-orange-400 to-pink-500 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
          </div>
        </div>

        {/* Grid of Pill Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
          {content.components.items.map((item, index) => {
            const Icon = iconMap[item.name];

            return (
              <div 
                key={index} 
                className="group relative flex items-center gap-6 bg-white rounded-3xl px-8 py-7 
                           transition-all duration-500 cursor-pointer
                           border border-gray-200
                           shadow-[0_10px_30px_rgba(0,0,0,0.04)] 
                           hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] 
                           hover:-translate-y-2.5 active:scale-[0.98]"
              >
                {/* Vibrant Icon Box */}
                <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center 
                               bg-gradient-to-br from-pink-500 to-orange-500 
                               rounded-2xl shadow-lg 
                               group-hover:scale-110 group-hover:rotate-[6deg] 
                               transition-all duration-500 ease-out">
                  {Icon && <Icon size={32} className="text-white" strokeWidth={1.5} />}
                </div>

                {/* Text Content */}
                <div className="flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-orange-500 transition-all duration-300">
                    {item.name}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1.5 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
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

export default ComponentsSection;