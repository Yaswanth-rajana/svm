import { programsContent } from '../../data/content'

function InfrastructureSection({ program = 'infrastructure' }) {
  const data = programsContent[program] || programsContent.infrastructure;
  const sectionData = data.infrastructure;
  const isSpecializedProgram = program !== 'it-infrastructure' && program !== 'infrastructure';
  const leftWidthClass = isSpecializedProgram ? 'lg:w-[528px] lg:shrink-0' : 'lg:w-1/2';

  return (
    <section className={`bg-gradient-to-b from-black via-[#050d10] to-black pb-20 lg:pb-28 overflow-hidden ${
      isSpecializedProgram ? 'pt-6 lg:pt-10' : 'pt-20 lg:pt-28'
    }`}>
      <div className={`mx-auto px-4 md:px-8 lg:px-2 ${isSpecializedProgram ? 'max-w-7xl' : 'max-w-6xl'}`}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">

          {/* Left Content */}
          <div className={`w-full flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 ${leftWidthClass}`}>
            <h2 className={`text-4xl md:text-5xl font-bold text-white leading-tight drop-shadow-lg ${
              program === 'virtualization-engineering' ? 'lg:text-[50px]' : 'lg:text-6xl'
            }`}>
              {sectionData.title}
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full lg:mx-0"></div>

            <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-xl">
              {sectionData.description}
            </p>

            <ul className="text-gray-300 space-y-3 mt-4 text-left">
              {sectionData.highlights.map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  <span className="text-base md:text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Image */}
          <div className={`w-full flex justify-center ${
            isSpecializedProgram ? 'lg:flex-1 lg:justify-end' : 'lg:w-1/2'
          }`}>
            <div className="relative group">
              <img
                src={sectionData.image}
                alt="IT Infrastructure Diagram"
                className={`w-full h-auto mx-auto transition-transform duration-700 ease-out hover:scale-105 cursor-pointer ${
                  isSpecializedProgram ? 'max-w-[360px] lg:max-w-[640px] lg:mx-0' : 'max-w-[360px] lg:max-w-[520px]'
                }`}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default InfrastructureSection
