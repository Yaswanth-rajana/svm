import React from 'react';
import { content } from '../../data/content';

function JobRolesSection() {
  return (
    <section className="bg-black py-32 lg:py-44">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            {content.jobRoles.title}
          </h2>
          <p className="text-gray-400 text-lg">
            {content.jobRoles.subtitle}
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {content.jobRoles.roles.map((role, index) => (
            <div 
              key={index} 
              className="relative p-[1.5px] rounded-2xl bg-gradient-to-r from-[#ff0080] via-[#7928ca] to-[#ff4d4d]"
            >
              {/* Inner Card */}
              <div className="bg-[#120a06] rounded-[15px] p-6 lg:p-8 space-y-4 h-full">
                
                {/* Role Title Row */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm md:text-base">Role Title</span>
                  <span className="text-white font-medium text-right ml-4">
                    {role.name}
                  </span>
                </div>

                {/* India Salary Row */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm md:text-base">India Salary</span>
                  <span className="text-white font-medium text-right">
                    {role.india}
                  </span>
                </div>

                {/* Global Salary Row */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm md:text-base">Global Salary</span>
                  <span className="text-white font-medium text-right">
                    {role.global}
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

export default JobRolesSection;