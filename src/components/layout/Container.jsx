function Container({ children }) {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      {children}
    </div>
  )
}

export default Container