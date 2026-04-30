import React from 'react';
import { Server, Cloud, RefreshCw } from 'lucide-react';
import { content } from '../../data/content';
import InfraTypeCircle from '../ui/InfraTypeCircle';

function WhatIsInfra() {
  const icons = {
    "On-Prem": Server,
    "Cloud": Cloud,
    "Hybrid": RefreshCw
  };

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-24 lg:py-28">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
            Types of IT Infrastructure
          </h2>
          {/* Upgraded Divider */}
          {/* <div className="w-20 h-1.5 bg-gradient-to-r from-pink-500 to-orange-400 mx-auto mt-6 rounded-full shadow-sm"></div> */}
        </div>
        
        {/* Circles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 items-center justify-items-center">
          {content.infraTypes.types.map((type, index) => (
            <InfraTypeCircle 
              key={index}
              title={type.name}
              description={type.description}
              icon={icons[type.name]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhatIsInfra;