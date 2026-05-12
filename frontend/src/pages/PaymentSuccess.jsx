import React from 'react';

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-[#0b0f14] flex flex-col items-center justify-center p-4">
      <div className="bg-[#11161d] p-8 md:p-12 rounded-3xl border border-white/10 text-center max-w-md w-full shadow-2xl">
        <div className="w-20 h-20 bg-gradient-to-tr from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
        <p className="text-gray-400 mb-8 text-sm">
          You have successfully registered for the webinar. Check your email for joining details and next steps.
        </p>
        <a 
          href="/" 
          className="inline-block w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-4 rounded-xl font-bold shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default PaymentSuccess;
