import JobCard from '../ui/JobCard'
import { programsContent } from '../../data/content'

function DemandSection({ program = 'infrastructure' }) {
  const data = programsContent[program] || programsContent.infrastructure;
  const { demand } = data;
  return (
    <div className="bg-gradient-to-b from-black via-[#050d10] to-black pt-10 pb-20 lg:pt-14 lg:pb-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-8 md:px-16 lg:px-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{demand.title}</h2>
          {/* <div className="w-16 h-1.5 bg-gradient-to-r from-pink-500 to-orange-400 mx-auto mt-4 mb-6 rounded-full"></div> */}
          {demand.subtitle && (
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">{demand.subtitle}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {demand.jobRoles.map((role, index) => (
            <JobCard 
              key={index}
              title={role.title}
              description={role.description}
              salary={role.salary}
              route={role.route}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default DemandSection