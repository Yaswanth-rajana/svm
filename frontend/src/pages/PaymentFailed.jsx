import React from 'react';

const PaymentFailed = () => {
  return (
    <div className="min-h-screen bg-[#0b0f14] flex flex-col items-center justify-center p-4">
      <div className="bg-[#11161d] p-8 md:p-12 rounded-3xl border border-white/10 text-center max-w-md w-full shadow-2xl">
        <div className="w-20 h-20 bg-gradient-to-tr from-red-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.4)]">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Payment Failed</h1>
        <p className="text-gray-400 mb-8 text-sm">
          We couldn't process your payment. Please try again or contact support if the issue persists.
        </p>
        <a 
          href="/" 
          className="inline-block w-full bg-white/10 border border-white/20 text-white py-4 rounded-xl font-bold hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default PaymentFailed;
