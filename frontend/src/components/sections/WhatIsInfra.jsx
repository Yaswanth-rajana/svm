import { Server, Cloud, RefreshCw, Shield, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { programsContent } from '../../data/content';
import InfraTypeCircle from '../ui/InfraTypeCircle';

// Official Brand Logos (styled with their official brand colors, ignoring parent text-color overrides)
const AWSLogo = ({ size = 24 }) => (
  <svg role="img" viewBox="0 0 24 24" width={size} height={size} className="text-[#FF9900]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <title>Amazon AWS</title>
    <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.2l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 0 1-.303.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.416-.287-.807-.415l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 0 1-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167zM21.698 16.207c-2.626 1.94-6.442 2.969-9.722 2.969-4.598 0-8.74-1.7-11.87-4.526-.247-.223-.024-.527.272-.351 3.384 1.963 7.559 3.153 11.877 3.153 2.914 0 6.114-.607 9.06-1.852.439-.2.814.287.383.607zM22.792 14.961c-.336-.43-2.22-.207-3.074-.103-.255.032-.295-.192-.063-.36 1.5-1.053 3.967-.75 4.254-.399.287.36-.08 2.826-1.485 4.007-.215.184-.423.088-.327-.151.32-.79 1.03-2.57.695-2.994z" />
  </svg>
);

const AzureLogo = ({ size = 24 }) => (
  <svg role="img" viewBox="0 0 24 24" width={size} height={size} className="text-[#0089D6]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <title>Microsoft Azure</title>
    <path d="M22.379 23.343a1.62 1.62 0 0 0 1.536-2.14v.002L17.35 1.76A1.62 1.62 0 0 0 15.816.657H8.184A1.62 1.62 0 0 0 6.65 1.76L.086 21.204a1.62 1.62 0 0 0 1.536 2.139h4.741a1.62 1.62 0 0 0 1.535-1.103l.977-2.892 4.947 3.675c.28.208.618.32.966.32m-3.084-12.531 3.624 10.739a.54.54 0 0 1-.51.713v-.001h-.03a.54.54 0 0 1-.322-.106l-9.287-6.9h4.853m6.313 7.006c.116-.326.13-.694.007-1.058L9.79 1.76a1.722 1.722 0 0 0-.007-.02h6.034a.54.54 0 0 1 .512.366l6.562 19.445a.54.54 0 0 1-.338.684"/>
  </svg>
);

const GCPLogo = ({ size = 24 }) => (
  <svg role="img" viewBox="0 0 24 24" width={size} height={size} className="text-[#4285F4]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <title>Google Cloud</title>
    <path d="M12.19 2.38a9.344 9.344 0 0 0-9.234 6.893c.053-.02-.055.013 0 0-3.875 2.551-3.922 8.11-.247 10.941l.006-.007-.007.03a6.717 6.717 0 0 0 4.077 1.356h5.173l.03.03h5.192c6.687.053 9.376-8.605 3.835-12.35a9.365 9.365 0 0 0-2.821-4.552l-.043.043.006-.05A9.344 9.344 0 0 0 12.19 2.38zm-.358 4.146c1.244-.04 2.518.368 3.486 1.15a5.186 5.186 0 0 1 1.862 4.078v.518c3.53-.07 3.53 5.262 0 5.193h-5.193l-.008.009v-.04H6.785a2.59 2.59 0 0 1-1.067-.23h.001a2.597 2.597 0 1 1 3.437-3.437l3.013-3.012A6.747 6.747 0 0 0 8.11 8.24c.018-.01.04-.026.054-.023a5.186 5.186 0 0 1 3.67-1.69z"/>
  </svg>
);

const OracleLogo = ({ size = 24 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className="text-[#F00000]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <title>Oracle</title>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
  </svg>
);

const VMwareLogo = ({ size = 24 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className="text-[#0095D9]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <title>VMware</title>
    <path d="M2 2h9v9H2V2zm11 0h9v9h-9V2zM2 13h9v9H2v-9zm11 0h9v9h-9v-9z" />
  </svg>
);

const AlibabaLogo = ({ size = 24 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className="text-[#FF6A00]" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <title>Alibaba</title>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
  </svg>
);

const logoMap = {
  AWS: AWSLogo,
  Azure: AzureLogo,
  GCP: GCPLogo,
  "Google Cloud": GCPLogo,
  "Google Cloud Platform": GCPLogo,
  Oracle: OracleLogo,
  VMware: VMwareLogo,
  Alibaba: AlibabaLogo
};

function WhatIsInfra({ program = 'infrastructure' }) {
  const data = programsContent[program] || programsContent.infrastructure;
  const sectionData = data.infraTypes;

  const isCloud = program === 'cloud-computing';

  const icons = {
    "On-Prem": Server,
    "Cloud": Cloud,
    "Hybrid": RefreshCw,
    "Public Cloud": Cloud,
    "Private Cloud": Shield,
    "Hybrid Cloud": RefreshCw,
    "Multi-Cloud": Globe
  };

  if (isCloud) {
    return (
      <section className="bg-white py-24 lg:py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {sectionData.title}
            </h2>
            {sectionData.subtitle && (
              <p className="text-gray-500 text-lg md:text-xl max-w-3xl mx-auto mt-5 leading-relaxed font-semibold">
                {sectionData.subtitle}
              </p>
            )}
          </div>

          {/* Cards Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 items-stretch"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
          >
            {sectionData.types.map((provider, index) => {
              const Logo = logoMap[provider.icon] || logoMap[provider.name] || Server;
              const glowStyle = {
                '--glow-color': provider.glowColor || 'rgba(0,0,0,0.02)',
              };

              return (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 40 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
                  }}
                  whileHover={{ scale: 1.02, y: -8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  style={glowStyle}
                  className="group relative flex flex-col justify-between bg-white border border-gray-200/80 rounded-[24px] p-8 transition-shadow duration-200 ease-out cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_var(--glow-color)] h-full overflow-hidden"
                >
                  {/* Subtle Top Gradient Accent Line */}
                  <div className={`absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r ${provider.accentColor}`}></div>

                  <div className="flex flex-col h-full justify-between">
                    <div>
                      {/* Logo Wrapper */}
                      <div className="w-16 h-16 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-200 ease-out">
                        <Logo size={32} />
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {provider.name}
                      </h3>

                      {/* Small badge under title */}
                      {provider.badge && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-100/80 text-[10px] md:text-xs font-bold text-gray-600 mb-5 uppercase tracking-wider">
                          {provider.badge}
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                        {provider.description}
                      </p>

                      {/* Technology Tags */}
                      {provider.tags && (
                        <div className="flex flex-wrap gap-2.5 mb-8">
                          {provider.tags.map((tag, tIdx) => (
                            <span 
                              key={tIdx} 
                              className="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-full text-xs font-bold hover:bg-gray-100 hover:border-gray-200 transition-colors"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Stats Line */}
                    {provider.stat && (
                      <div className="pt-6 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-auto">
                        <span>Key Stat</span>
                        <span className={`bg-gradient-to-r ${provider.accentColor} bg-clip-text text-transparent`}>
                          {provider.stat}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
        
        {/* Required animation styling */}
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2.5s infinite linear;
          }
        `}</style>
      </section>
    );
  }

  // Fallback / Default IT Infrastructure circular models
  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-24 lg:py-28">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
            {sectionData.title}
          </h2>
        </div>
        
        {/* Circles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 items-center justify-items-center">
          {sectionData.types.map((type, index) => {
            const IconComponent = logoMap[type.icon] || logoMap[type.name] || icons[type.name] || Server;
            return (
              <InfraTypeCircle 
                key={index}
                title={type.name}
                description={type.description}
                icon={IconComponent}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhatIsInfra;