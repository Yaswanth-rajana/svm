import { motion } from 'framer-motion';
import { programsContent } from '../../data/content';

function JobRolesSection({ program = 'infrastructure' }) {
  const data = programsContent[program] || programsContent.infrastructure;
  const sectionData = data.jobRoles;
  const isCloud = program === 'cloud-computing';

  if (isCloud) {
    return (
      <section className="bg-black py-32 lg:py-44 select-none overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
              {sectionData.title}
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              {sectionData.subtitle}
            </p>
          </div>

          {/* Tiers Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-stretch"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
          >
            {sectionData.tiers.map((tier, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="relative p-[1.5px] rounded-3xl bg-gradient-to-br from-[#ff0080] via-[#7928ca] to-[#ff4d4d] cursor-pointer"
              >
                {/* Inner Card */}
                <div className="bg-[#0B0604] rounded-[22.5px] p-8 flex flex-col justify-between h-full space-y-6">
                  
                  {/* Top content */}
                  <div>
                    {/* Badge */}
                    <span className="inline-flex px-3 py-1 bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 rounded-full uppercase tracking-wider mb-4 w-fit">
                      {tier.badge}
                    </span>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white tracking-tight">
                      {tier.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-gray-400 text-sm mt-2 leading-relaxed font-semibold">
                      {tier.subtitle}
                    </p>
                  </div>

                  {/* Middle content - Payscale info */}
                  <div className="py-2">
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                      Average Salary (India)
                    </div>
                    <div className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-white via-white to-pink-500 bg-clip-text text-transparent mt-1.5">
                      {tier.salary}
                    </div>
                  </div>

                  {/* Bottom content - Target roles */}
                  <div className="border-t border-white/5 pt-5 mt-auto">
                    <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">
                      Target Job Roles
                    </div>
                    <ul className="space-y-2.5">
                      {tier.roles.map((role, rIdx) => (
                        <li key={rIdx} className="text-gray-400 text-sm font-semibold flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 flex-shrink-0"></span>
                          <span>{role}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    );
  }

  // Fallback / IT Infrastructure (6 card layout)
  return (
    <section className="bg-black py-32 lg:py-44">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            {sectionData.title}
          </h2>
          <p className="text-gray-400 text-lg">
            {sectionData.subtitle}
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {sectionData.roles.map((role, index) => (
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