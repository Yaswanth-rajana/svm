import JobCard from '../ui/JobCard'
import { content } from '../../data/content'

function DemandSection() {
  return (
    <div className="bg-gradient-to-b from-black via-[#050d10] to-black py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{content.demand.title}</h2>
          {/* <div className="w-16 h-1.5 bg-gradient-to-r from-pink-500 to-orange-400 mx-auto mt-4 mb-6 rounded-full"></div> */}
          {content.demand.subtitle && (
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">{content.demand.subtitle}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {content.demand.jobRoles.map((role, index) => (
            <JobCard 
              key={index}
              title={role.title}
              description={role.description}
              salary={role.salary}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default DemandSection