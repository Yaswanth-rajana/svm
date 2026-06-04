import { Link } from 'react-router-dom';

function JobCard({ title, description, salary, route }) {
  const activeRoute = null; // Temporarily disabled redirection and Know More button

  const CardContent = (
    <>
      <div className="h-1 w-full bg-gradient-to-r from-pink-500 to-orange-400"></div>
      <div className="p-6 md:p-8 flex flex-col justify-between h-full">
        <div>
          <h3 className="text-white text-xl md:text-2xl font-semibold mb-3">{title}</h3>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6">{description}</p>
        </div>
        <div className="mt-2 flex items-center justify-between flex-wrap gap-4">
          <span className="inline-block bg-orange-400/10 text-orange-400 px-4 py-1.5 rounded-full text-sm font-semibold border border-orange-400/20">
            {salary}
          </span>
          {activeRoute && (
            <span className="inline-flex items-center gap-1.5 bg-orange-400/10 text-orange-400 px-4 py-1.5 rounded-full text-sm font-semibold border border-orange-400/20 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-orange-400 group-hover:text-white group-hover:border-transparent">
              Know More
              <span className="inline-block transform transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          )}
        </div>
      </div>
    </>
  );

  const cardClasses = "bg-[#0b1a1f] bg-gradient-to-b from-white/5 to-transparent border border-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] transition duration-300 hover:border-orange-400 group block h-full";

  if (activeRoute) {
    return (
      <Link 
        to={activeRoute}
        className={`${cardClasses} cursor-pointer`}
        style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}
      >
        {CardContent}
      </Link>
    );
  }

  return (
    <div 
      className={cardClasses}
      style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}
    >
      {CardContent}
    </div>
  );
}

export default JobCard;
