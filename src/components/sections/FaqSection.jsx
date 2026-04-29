import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { content } from '../../data/content';
import { openLeadModal } from '../ui/LeadModal';

const FaqItem = ({ question, answer, list, isOpen, onClick }) => {
  return (
    <div 
      className={`group bg-white border transition-all duration-300 ease-in-out rounded-2xl overflow-hidden ${
        isOpen 
        ? 'shadow-md border-pink-200 bg-white' 
        : 'shadow-sm border-gray-100 hover:shadow-md hover:border-pink-100 hover:-translate-y-0.5'
      }`}
    >
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none"
      >
        <span className={`text-base sm:text-lg font-medium sm:font-semibold transition-colors duration-300 pr-4 ${isOpen ? 'text-pink-600' : 'text-gray-900 group-hover:text-pink-600'}`}>
          {question}
        </span>
        <ChevronDown 
          className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180 text-pink-500' : 'text-gray-400 group-hover:text-pink-500'}`} 
        />
      </button>
      
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
          <p>{answer}</p>
          {list && list.length > 0 && (
            <ul className="mt-3 space-y-2 list-disc list-inside">
              {list.map((item, idx) => (
                <li key={idx} className="text-gray-600">{item}</li>
              ))}
            </ul>
          )}
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
    <section className="bg-[#f8fafc] py-20 px-8 md:px-16 lg:px-24" id="faq">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
            {faq.title}
          </h2>
          <div className="h-1.5 w-24 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full mx-auto mt-6 mb-6"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {faq.subtitle}
          </p>
        </div>

        <div className="space-y-4 sm:space-y-5">
          {faq.questions.map((item, index) => (
            <FaqItem
              key={index}
              question={item.question}
              answer={item.answer}
              list={item.list}
              isOpen={openIndex === index}
              onClick={() => handleToggle(index)}
            />
          ))}
        </div>

        <div className="text-center mt-12 sm:mt-16">
          <p className="text-gray-600">
            Still have questions?{' '}
            <a 
              href="tel:+919876543210"
              className="text-pink-600 font-semibold hover:text-pink-700 hover:underline transition-colors"
            >
              Call us now
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;

