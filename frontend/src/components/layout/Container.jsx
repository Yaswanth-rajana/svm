function Container({ children, className = "", pxClasses = "px-6 md:px-16 lg:px-24" }) {
  return (
    <div className={`max-w-[1400px] mx-auto ${pxClasses} ${className}`}>
      {children}
    </div>
  )
}

export default Container