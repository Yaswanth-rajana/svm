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
          <p className="mt-8 text-[#9CA3AF] text-lg max-w-2xl mx-auto leading-relaxed">
            {mentors.subtitle}
          </p>
        </div>

        {/* Mentors Grid - Refined Card Theme */}
        <div className="flex justify-center items-center w-full">
          {mentors.list.map((mentor, index) => (
            <div 
              key={index} 
              className="group relative flex flex-col items-center text-center p-10 md:p-12 rounded-2xl bg-[#11161d] border border-pink-500/20 shadow-[0_0_30px_rgba(255,77,141,0.08)] transition-all duration-500 hover:bg-[#161c24] hover:border-pink-500/40 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(255,100,150,0.25)] w-full max-w-md"
            >
              {/* Profile Image with Glow & Gradient Border */}
              <div className="relative mb-6 transition-all duration-500">
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full p-[3px] bg-gradient-to-br from-[#ff4d8d] to-[#ff8a3d] shadow-[0_0_20px_rgba(255,100,150,0.2)] group-hover:shadow-[0_0_40px_rgba(255,100,150,0.4)] transition-all duration-500 group-hover:scale-105">
                  <div className="w-full h-full rounded-full overflow-hidden border-[4px] border-[#0B0F14] bg-[#0B0F14]">
                    <img 
                      src={mentor.photo} 
                      alt={mentor.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                </div>
              </div>

              {/* Identity Details */}
              <div className="flex flex-col items-center w-full">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                  {mentor.name}
                </h3>
                
                {/* Role */}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d8d] to-[#ff8a3d] font-bold text-lg md:text-xl mb-3">
                  {mentor.role}
                </span>

                {/* LinkedIn Button */}
                <a 
                  href={mentor.linkedin || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-400/90 hover:text-blue-400 hover:underline transition-colors duration-300 font-medium text-sm md:text-base mb-6"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                  View LinkedIn Profile
                </a>

                {/* Credibility Hint */}
                <span className="text-[#9CA3AF] text-sm md:text-base font-medium">
                  {mentor.credibility}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MentorSection;