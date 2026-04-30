function Button({ children, variant = "primary", className = "", fullWidth = false, onClick, type = "button" }) {
  const baseStyles = "px-6 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center"
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-xl hover:scale-105",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-orange-400 focus:outline-none",
    white: "bg-white text-black shadow-md hover:shadow-xl hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]",
    orange: "bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl"
  }
  
  return (
    <button 
      type={type}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`} 
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button