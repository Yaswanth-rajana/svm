
const InfraTypeCircle = ({ title, description, icon: Icon }) => {
  return (
    <div className="flex flex-col items-center">
      {/* Circle Card - Floating Object Style */}
      <div className="group w-60 h-60 rounded-full bg-white border border-gray-200 
                    shadow-[0_10px_30px_rgba(0,0,0,0.08)] 
                    hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] 
                    flex flex-col items-center justify-center text-center p-6
                    transition-all duration-300 hover:-translate-y-2 cursor-pointer">
        
        {/* Icon Anchor (Subtle Background) */}
        {Icon && (
          <div className="w-12 h-12 flex items-center justify-center rounded-full 
                        bg-gradient-to-r from-pink-50 to-orange-50 mb-4
                        group-hover:from-pink-100 group-hover:to-orange-100 transition-colors">
            <Icon size={24} className="text-pink-500" />
          </div>
        )}
        
        {/* Typography */}
        <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
          {title}
        </h3>
        
        <p className="text-sm text-gray-500 mt-2 px-4 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default InfraTypeCircle;
