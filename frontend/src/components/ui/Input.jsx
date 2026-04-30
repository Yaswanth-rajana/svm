function Input({ type = "text", placeholder, value, onChange, className = "", required = false, as = "input", options = [], ...rest }) {
  const baseStyles = "w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white/90 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition duration-200 hover:border-orange-400 text-gray-800"
  
  if (as === "select") {
    return (
      <select 
        className={`${baseStyles} ${className}`}
        value={value}
        onChange={onChange}
        required={required}
        {...rest}
      >
        <option value="" disabled hidden>{placeholder}</option>
        {options.map((opt, i) => (
          <option key={i} value={opt.value || opt}>{opt.label || opt}</option>
        ))}
      </select>
    )
  }

  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`${baseStyles} ${className}`}
      value={value}
      onChange={onChange}
      required={required}
      {...rest}
    />
  )
}

export default Input
