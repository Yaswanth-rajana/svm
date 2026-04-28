import React from 'react';
import { content } from '../../data/content';

function MentorSection() {
  const { mentors } = content;

  return (
    <section className="bg-[#0B0F14] py-20 lg:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            {mentors.title}
          </h2>
          {/* <div className="w-16 h-1 bg-gradient-to-r from-[#ff4d8d] to-[#ff8a3d] mx-auto mt-4 rounded-full"></div> */}
          <p className="mt-8 text-[#9CA3AF] text-lg max-w-2xl mx-auto leading-relaxed">
            {mentors.subtitle}
          </p>
        </div>

        {/* Mentors Grid - Refined Card Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-10 items-start justify-center max-w-4xl mx-auto">
          {mentors.list.map((mentor, index) => (
            <div 
              key={index} 
              className="group relative flex flex-col items-center text-center p-8 rounded-xl bg-white/[0.06] border border-white/10 transition-all duration-500 hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              {/* Profile Image with Glow & Gradient Border */}
              <div className="relative mb-3 transition-all duration-500">
                <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full p-[2px] bg-gradient-to-br from-[#ff4d8d] to-[#ff8a3d] shadow-[0_0_20px_rgba(255,100,150,0.15)] group-hover:shadow-[0_0_30px_rgba(255,100,150,0.3)] transition-all duration-500">
                  <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-[#0B0F14] bg-[#0B0F14]">
                    <img 
                      src={mentor.photo} 
                      alt={mentor.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                </div>
              </div>

              {/* Identity Details */}
              <div className="flex flex-col items-center">
                {/* Tiny Label Above Name */}
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#6B7280] mb-1.5 group-hover:text-[#ff4d8d] transition-colors">
                  {mentor.role.split(' ')[0]} Expert
                </span>
                
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">
                  {mentor.name}
                </h3>
                
                {/* Company & Role */}
                <div className="flex flex-col items-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d8d] to-[#ff8a3d] font-bold text-base mb-1">
                    {mentor.company}
                  </span>
                  <span className="text-[#9CA3AF] text-sm font-medium">
                    {mentor.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MentorSection;