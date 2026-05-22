import { motion } from 'framer-motion';
import { openBenefitsModal } from '../../utils/benefitsModalEvents';

const BenefitsLink = () => {
  return (
    <div className="flex justify-center w-full pt-1 pb-2">
      <button
        type="button"
        onClick={openBenefitsModal}
        className="group inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold cursor-pointer select-none bg-transparent border-0 p-0 outline-none"
      >
        {/* Glow pulsing container (non-clipped parent) */}
        <motion.span
          animate={{
            filter: [
              'drop-shadow(0px 0px 4px rgba(244,63,94,0.15))',
              'drop-shadow(0px 0px 10px rgba(249,115,22,0.45))',
              'drop-shadow(0px 0px 4px rgba(244,63,94,0.15))'
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex items-center gap-1 transition-all duration-300 group-hover:brightness-110"
        >
          {/* Sparkle Twinkle */}
          <motion.span
            animate={{
              scale: [1, 1.15, 1],
              rotate: [0, 2, -2, 0],
              opacity: [0.75, 1, 0.75]
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block origin-center"
          >
            ✨
          </motion.span>
          
          {/* Gradient Text */}
          <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
            See webinar benefits
          </span>
        </motion.span>
        
        {/* Arrow Motion */}
        <motion.span
          animate={{
            x: [0, 4, 0]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-orange-400 group-hover:text-pink-400 transition-colors duration-300 ml-0.5"
        >
          →
        </motion.span>
      </button>
    </div>
  );
};

export default BenefitsLink;
