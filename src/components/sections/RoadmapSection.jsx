import React from 'react';
import { content } from '../../data/content';
import { ArrowRight } from 'lucide-react';

function RoadmapSection() {
  const { roadmap } = content;

  return (
    <section className="bg-[#f8f9fb] py-[72px] overflow-hidden" id="roadmap">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">
            Career Roadmap
          </span>
          <h2 className="text-[32px] font-bold text-gray-900 mb-4 tracking-tight">
            {roadmap.title}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            {roadmap.subtitle}
          </p>
        </div>

        {/* Timeline Container */}
        <div className="max-w-[720px] mx-auto relative px-4">
          
          {/* Vertical Gradient Line */}
          <div className="absolute left-[36px] top-0 bottom-0 w-[4px] bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>

          {/* Steps */}
          <div className="space-y-10 relative">
            {roadmap.steps.map((step, index) => (
              <div key={index} className="flex gap-8 group">
                
                {/* Badge Column */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-bold text-gray-900 shadow-[0_0_15px_rgba(59,130,246,0.2)] border border-gray-100 z-10 relative group-hover:scale-110 transition-transform duration-300">
                    {index + 1}
                  </div>
                  {/* Subtle Glow Ring */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-pink-500 rounded-full blur opacity-10 group-hover:opacity-25 transition-opacity"></div>
                </div>

                {/* Card Column */}
                <div className="flex-1 bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
                  
                  {/* Title & Duration Pill */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-4">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {step.title}
                    </h3>
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                      {step.duration}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {step.description}
                  </p>

                  {/* Skill Tags */}
                  <div className="flex flex-wrap gap-2">
                    {step.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="px-2 py-1 rounded bg-gray-50 text-gray-500 text-[10px] font-medium border border-gray-100">
                        {tag}
                      </span>
                    ))}
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-20">
          <button className="px-10 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 mx-auto">
            <span>Start your journey at the free webinar</span>
            <ArrowRight size={20} />
          </button>
        </div>

      </div>
    </section>
  );
}

export default RoadmapSection;