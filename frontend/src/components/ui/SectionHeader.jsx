function SectionHeader({ title, subtitle }) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-gray-800 mb-3">{title}</h2>
      {subtitle && <p className="text-gray-600 text-lg">{subtitle}</p>}
      <div className="w-20 h-1 bg-blue-600 mx-auto mt-4"></div>
    </div>
  )
}

export default SectionHeader