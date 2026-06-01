import { programsContent } from '../../data/content';
import Container from '../layout/Container'; // adjust path as needed

function MentorSection({ program = 'infrastructure' }) {
  const data = programsContent[program] || programsContent.infrastructure;
  const { mentors } = data;

  return (
    <section className="relative bg-[#0B0F14] pt-20 pb-10 lg:pt-28 lg:pb-14 overflow-hidden">
      {/* Side fade to make center content feel focused */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0B0F14] via-transparent to-[#0B0F14]" />
      
      {/* Use Container but override its width behavior for inner content */}
      <Container>
        <div className="relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              {mentors.title}
            </h2>
            <p className="mt-8 text-[#9CA3AF] text-lg leading-relaxed">
              {mentors.subtitle}
            </p>
          </div>

          {/* Card - Centered with smaller width */}
          <div className="flex justify-center">
            {mentors.list.map((mentor, index) => (
              <div 
                key={index} 
                className="group relative flex flex-col items-center text-center p-6 md:p-8 rounded-2xl bg-[#11161d] border border-pink-500/20 shadow-[0_0_15px_rgba(255,77,141,0.08)] transition-all duration-500 hover:bg-[#161c24] hover:border-pink-500/40 hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(255,100,150,0.2)] w-[320px] md:w-[360px]"
              >
                {/* Profile Image with Glow & Gradient Border */}
                <div className="relative mb-6 transition-all duration-500">
                  <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full p-[3px] bg-gradient-to-br from-[#ff4d8d] to-[#ff8a3d] shadow-[0_0_20px_rgba(255,100,150,0.2)] group-hover:shadow-[0_0_40px_rgba(255,100,150,0.4)] transition-all duration-500 group-hover:scale-105">
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
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1 tracking-tight">
                    {mentor.name}
                  </h3>
                  
                  {/* Role */}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d8d] to-[#ff8a3d] font-bold text-base md:text-lg mb-3">
                    {mentor.role}
                  </span>

                  {/* LinkedIn Button */}
                  <a 
                    href={mentor.linkedin || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400/90 hover:text-blue-400 hover:underline transition-colors duration-300 font-medium text-sm mb-4"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
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
                  <span className="text-[#9CA3AF] text-sm font-medium">
                    {mentor.credibility || mentor.experience}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default MentorSection;