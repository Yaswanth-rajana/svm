function Container({ children }) {
  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-16 lg:px-24">
      {children}
    </div>
  )
}

export default Container