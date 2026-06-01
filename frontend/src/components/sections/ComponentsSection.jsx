import { 
  Monitor, 
  Cloud, 
  Package, 
  ShieldCheck, 
  Network, 
  Cpu, 
  Database, 
  Wrench,
  Globe,
  Lock,
  Layers,
  Activity,
  Terminal,
  Server,
  Award,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { programsContent } from '../../data/content';

const iconMap = {
  Monitor,
  Cloud,
  Package,
  ShieldCheck,
  Network,
  Cpu,
  Database,
  Wrench,
  Globe,
  Lock,
  Layers,
  Activity,
  Terminal,
  Server,
  Award,
  Users,
  // Name mappings for backwards compatibility
  Hardware: Monitor,
  Software: Package,
  Security: ShieldCheck,
  Networks: Network,
  IaaS: Cpu,
  "Data Centers": Database,
  ITSM: Wrench
};

function ComponentsSection({ program = 'infrastructure' }) {
  const data = programsContent[program] || programsContent.infrastructure;
  const sectionData = data.components;

  const isCloud = program === 'cloud-computing';

  if (isCloud) {
    const highlights = sectionData.highlights || [];

    // Animation variants for checklist staggering
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.2
        }
      }
    };

    const itemVariants = {
      hidden: { opacity: 0, x: -20 },
      visible: {
        opacity: 1,
        x: 0,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 15
        }
      }
    };

    return (
      <section className="bg-white py-24 lg:py-32 overflow-hidden select-none">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          
          {/* Main Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {sectionData.title}
            </h2>
            {sectionData.subtitle && (
              <p className="text-gray-500 text-lg md:text-xl max-w-3xl mx-auto mt-5 leading-relaxed font-semibold">
                {sectionData.subtitle}
              </p>
            )}
          </div>

          {/* Two Column Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 lg:gap-16 items-start">
            
            {/* LEFT COLUMN - Checklist (60% / 6 cols out of 10) */}
            <div className="lg:col-span-6">
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
                {sectionData.differentTitle || "What Makes Us Different?"}
              </h3>

              <motion.div 
                className="space-y-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={containerVariants}
              >
                {sectionData.items.map((item, index) => {
                  return (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ x: 6 }}
                      className="group flex gap-5 items-start p-4 hover:bg-slate-50/50 rounded-2xl transition-colors duration-200 cursor-pointer"
                    >
                      {/* Animated Checkbox Icon with Gradient Background */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>

                      {/* Text details */}
                      <div className="flex flex-col">
                        <h4 className="text-lg md:text-xl font-bold text-slate-950 group-hover:text-pink-600 transition-colors duration-200">
                          {item.name}
                        </h4>
                        <p className="text-gray-500 text-sm mt-1.5 leading-relaxed font-semibold">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* RIGHT COLUMN - Highlights Panel (40% / 4 cols out of 10) */}
            <div className="lg:col-span-4">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                whileHover={{ y: -4 }}
                className="relative bg-white border border-slate-100 rounded-[28px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden"
              >
                {/* Accent strip at top */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 to-orange-400"></div>
                
                <h4 className="text-xl font-bold text-slate-900 tracking-tight mb-6">
                  Program Highlights
                </h4>

                <ul className="space-y-4">
                  {highlights.map((highlight, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * index }}
                      className="group flex items-center gap-3.5 cursor-pointer text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors"
                    >
                      {/* Compact colored check circle */}
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-50 border border-pink-100/80 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-pink-500 group-hover:to-orange-500 transition-all duration-300">
                        <svg className="w-3 h-3 text-pink-500 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      
                      <span>{highlight}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>

          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-24 lg:py-28">
      <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-24">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            {sectionData.title}
          </h2>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {sectionData.subtitle}
          </p>
          {/* Animated Divider */}
          <div className="relative w-24 h-1.5 mx-auto mt-8 overflow-hidden rounded-full bg-gray-100">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-orange-400 to-pink-500 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
          </div>
        </div>

        {/* Grid of Pill Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto">
          {sectionData.items.map((item, index) => {
            const Icon = iconMap[item.icon] || iconMap[item.name] || Monitor;

            return (
              <div 
                key={index} 
                className="group relative flex items-center gap-6 bg-white rounded-3xl px-8 py-7 
                           transition-all duration-300 ease-out cursor-pointer
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
                               transition-all duration-300 ease-out">
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