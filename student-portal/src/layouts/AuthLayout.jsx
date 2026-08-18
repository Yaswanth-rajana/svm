import { BRAND } from '../constants/theme';

export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between relative overflow-hidden bg-[#0b0f14]">
      {/* Background Glow Spheres */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Website Style Top Header */}
      <header className="bg-black border-b border-gray-800 shadow-md relative z-20 w-full">
        <div className="max-w-[1600px] mx-auto px-4 md:px-12 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer flex-shrink-0">
            <img
              src="/logo2.png"
              alt="Smart Mate Ventures"
              style={{ height: '48px', width: 'auto', maxWidth: '300px', objectFit: 'contain' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-400 font-semibold border border-pink-500/20 font-mono">
              Learning Portal
            </span>
          </div>
        </div>
      </header>

      {/* Main Auth Content */}
      <main className="w-full flex-1 flex items-center justify-center my-8 px-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-gray-500 py-4 border-t border-white/5">
        <p>© {new Date().getFullYear()} {BRAND.NAME}. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;
