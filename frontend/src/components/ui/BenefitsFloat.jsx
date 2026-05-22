import { motion } from 'framer-motion';
import { openBenefitsModal } from '../../utils/benefitsModalEvents';

const BenefitsFloat = () => {
  return (
    <div className="fixed left-6 bottom-28 md:left-8 z-[9998] flex flex-col items-center gap-1">
      <motion.button
        initial={{ opacity: 0, x: -30, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2, type: 'spring', stiffness: 200 }}
        whileHover={{ 
          scale: 1.03,
          boxShadow: "0 0 12px rgba(236,72,153,0.25), 0 0 8px rgba(249,115,22,0.12)" 
        }}
        whileTap={{ scale: 0.97 }}
        onClick={openBenefitsModal}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#11161d]/90 backdrop-blur-xl border border-pink-500/25 text-white font-extrabold text-[10px] md:text-[11px] tracking-wider uppercase cursor-pointer transition-all duration-300"
        style={{
          boxShadow: "0 0 6px rgba(236,72,153,0.1)"
        }}
      >
        {/* Subtle Pink -> Orange Gradient Border Glow */}
        <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-pink-500 to-orange-500 opacity-12 blur-xs -z-10 hover:opacity-35 transition-opacity"></div>
        
        <span className="text-pink-400 text-[10px] md:text-xs animate-[pulse_1.5s_infinite]">✨</span>
        <span className="bg-gradient-to-r from-white via-white to-pink-100 bg-clip-text text-transparent">
          What You'll Gain
        </span>
      </motion.button>
      
      {/* Tiny Microcopy for discoverability */}
      <motion.span 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ delay: 0.6 }}
        className="text-[8.5px] font-bold text-white uppercase tracking-[0.15em] select-none pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
      >
        Benefits & Bonuses
      </motion.span>
    </div>
  );
};

export default BenefitsFloat;
