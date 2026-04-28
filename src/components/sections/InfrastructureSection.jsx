import React from 'react'
import { content } from '../../data/content'

function InfrastructureSection() {
  return (
    <section className="bg-gradient-to-b from-black via-[#050d10] to-black py-20 lg:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          
          {/* Left Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg">
              {content.infrastructure.title}
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full lg:mx-0"></div>
            
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-xl">
              {content.infrastructure.description}
            </p>

            <ul className="text-gray-300 space-y-3 mt-4 text-left">
              {content.infrastructure.highlights.map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  <span className="text-base md:text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Image */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative group max-w-md lg:max-w-lg p-6">
              <img 
                src={content.infrastructure.image} 
                alt="IT Infrastructure Diagram" 
                className="relative w-full h-auto transition-transform duration-700 ease-out hover:scale-[1.04] cursor-pointer"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default InfrastructureSection
