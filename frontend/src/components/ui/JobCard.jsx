import React from 'react'

function JobCard({ title, description, salary }) {
  return (
    <div 
      className="bg-[#0b1a1f] bg-gradient-to-b from-white/5 to-transparent border border-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] transition duration-300 hover:border-orange-400 group"
      style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}
    >
      <div className="h-1 w-full bg-gradient-to-r from-pink-500 to-orange-400"></div>
      <div className="p-6 md:p-8">
        <h3 className="text-white text-xl md:text-2xl font-semibold mb-3">{title}</h3>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6">{description}</p>
        <div className="mt-2">
          <span className="inline-block bg-orange-400/10 text-orange-400 px-4 py-1.5 rounded-full text-sm font-semibold border border-orange-400/20">
            {salary}
          </span>
        </div>
      </div>
    </div>
  )
}

export default JobCard
