import { openBenefitsModal } from '../../utils/benefitsModalEvents';

const BenefitsLink = () => {
  return (
    <div className="flex justify-center w-full pt-1 pb-2">
      <button
        type="button"
        onClick={openBenefitsModal}
        className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-pink-400 transition-colors duration-250 cursor-pointer select-none bg-transparent border-0 p-0 outline-none"
      >
        <span>✨ See webinar benefits</span>
        <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
      </button>
    </div>
  );
};

export default BenefitsLink;
