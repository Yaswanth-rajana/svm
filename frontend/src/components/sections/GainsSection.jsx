import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Gift } from 'lucide-react';
import { content } from '../../data/content';

function GainsSection() {
  const { gains } = content;

  return (
    <section className="relative bg-gradient-to-b from-[#050505] via-[#0b0f14] to-black py-16 md:py-24 overflow-hidden">
      {/* Very faint background blur gradients */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500/[0.04] blur-[150px] rounded-full -z-10"></div>
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/[0.04] blur-[150px] rounded-full -z-10"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight leading-tight px-4">
            {gains.title}
          </h2>
          <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-medium px-4">
            {gains.subtitle}
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-pink-500 to-orange-400 mx-auto mt-6 rounded-full opacity-90 shadow-[0_0_10px_rgba(236,72,153,0.3)]"></div>
        </motion.div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 max-w-5xl mx-auto px-2 sm:px-4">
          
          {/* Left Card: Best Key Takeaways */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.05, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="group relative p-[1.5px] rounded-[2rem] bg-gradient-to-br from-pink-500/15 via-purple-500/15 to-orange-500/15 hover:from-pink-500/40 hover:via-purple-500/40 hover:to-orange-500/40 transition-all duration-500 cursor-default"
          >
            {/* Ambient Card Glow */}
            <div className="absolute -inset-[2px] rounded-[2rem] bg-gradient-to-r from-pink-500/0 via-purple-500/0 to-orange-500/0 group-hover:from-pink-500/5 group-hover:via-purple-500/5 group-hover:to-orange-500/5 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>
            
            {/* Glassmorphic Inner Card */}
            <div className="bg-[#11161d]/75 backdrop-blur-2xl rounded-[30px] p-6 sm:p-8 h-full flex flex-col transition-all duration-500 border border-white/5 group-hover:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.2)] group-hover:shadow-[0_0_35px_rgba(236,72,153,0.08)] bg-gradient-to-br from-white/[0.01] to-transparent">
              <div>
                {/* Header Icon + Title */}
                <div className="flex items-center gap-4 mb-6 sm:mb-8">
                  <div className="w-11 h-11 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.15)] group-hover:scale-105 group-hover:rotate-3 transition-all duration-500">
                    <CheckCircle2 size={22} className="text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-pink-400 transition-colors duration-300">
                    {gains.leftCard.title}
                  </h3>
                </div>

                {/* List Items */}
                <div className="space-y-4">
                  {gains.leftCard.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3.5 group/item">
                      <div className="mt-1 bg-pink-500/10 p-1 rounded-full group-hover:bg-pink-500/20 transition-colors flex-shrink-0">
                        <CheckCircle2 size={15} className="text-pink-500" />
                      </div>
                      <span className="text-gray-300 group-hover:text-white transition-colors duration-300 text-sm sm:text-base md:text-lg font-semibold leading-snug">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Card: Bonus Takeaways */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            className="group relative p-[1.5px] rounded-[2rem] bg-gradient-to-br from-pink-500/15 via-purple-500/15 to-orange-500/15 hover:from-pink-500/40 hover:via-purple-500/40 hover:to-orange-500/40 transition-all duration-500 cursor-default"
          >
            {/* Ambient Card Glow */}
            <div className="absolute -inset-[2px] rounded-[2rem] bg-gradient-to-r from-pink-500/0 via-purple-500/0 to-orange-500/0 group-hover:from-pink-500/5 group-hover:via-purple-500/5 group-hover:to-orange-500/5 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>
            
            {/* Glassmorphic Inner Card */}
            <div className="bg-[#11161d]/75 backdrop-blur-2xl rounded-[30px] p-6 sm:p-8 h-full flex flex-col transition-all duration-500 border border-white/5 group-hover:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.2)] group-hover:shadow-[0_0_35px_rgba(249,115,22,0.08)] bg-gradient-to-br from-white/[0.01] to-transparent">
              <div>
                {/* Header Icon + Title */}
                <div className="flex items-center gap-4 mb-6 sm:mb-8">
                  <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.15)] group-hover:scale-105 group-hover:rotate-3 transition-all duration-500">
                    <Gift size={22} className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-orange-400 transition-colors duration-300">
                    {gains.rightCard.title}
                  </h3>
                </div>

                {/* List Items */}
                <div className="space-y-4">
                  {gains.rightCard.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3.5 group/item">
                      <span className="text-xl flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-300 drop-shadow-[0_0_6px_rgba(249,115,22,0.2)]">
                        🎁
                      </span>
                      <span className="text-gray-300 group-hover:text-white transition-colors duration-300 text-sm sm:text-base md:text-lg font-semibold leading-snug">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export default GainsSection;
