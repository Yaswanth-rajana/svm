import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { content } from '../../data/content';

const FaqItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div 
      className={`group bg-white border transition-all duration-500 rounded-3xl overflow-hidden ${
        isOpen 
        ? 'shadow-[0_2px_6px_rgba(0,0,0,0.04),0_20px_40px_rgba(0,0,0,0.08)] border-pink-200/60 scale-[1.02] z-10' 
        : 'shadow-[0_2px_6px_rgba(0,0,0,0.02),0_8px_20px_rgba(0,0,0,0.04)] border-gray-100/80 hover:border-pink-100 hover:-translate-y-1'
      }`}
    >
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-7 md:p-8 text-left focus:outline-none transition-all duration-300 ${isOpen ? 'bg-white' : 'bg-white'}`}
      >
        <span className={`text-lg md:text-xl font-bold transition-all duration-300 pr-8 ${isOpen ? 'bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent' : 'text-gray-900 group-hover:text-pink-500'}`}>
          {question}
        </span>
        <ChevronDown 
          className={`w-6 h-6 flex-shrink-0 transition-all duration-500 ${isOpen ? 'rotate-180 text-pink-500' : 'text-gray-400 group-hover:text-pink-500'}`} 
        />
      </button>
      
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-7 md:px-8 pb-7 md:pb-8 text-gray-600 leading-relaxed text-[16px] md:text-[17px]">
          <div className="w-full h-px bg-gray-50 mb-7"></div>
          <div className="pt-2">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};

const FaqSection = () => {
  const { faq } = content;
  const [openIndex, setOpenIndex] = useState(-1);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="relative bg-[#f8fafc] py-28 px-6 overflow-hidden" id="faq">
      {/* Premium Background Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-pink-500/10 blur-[140px] rounded-full -z-10 opacity-60"></div>
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-orange-500/10 blur-[140px] rounded-full -z-10 opacity-60"></div>

      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-gray-900">
            {faq.title}
          </h2>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            {faq.subtitle}
          </p>
        </div>

        <div className="space-y-6">
          {faq.questions.map((item, index) => (
            <FaqItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onClick={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
