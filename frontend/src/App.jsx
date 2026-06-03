import Navbar from './components/layout/Navbar'
import HeroSection from './components/sections/HeroSection'
import DemandSection from './components/sections/DemandSection'
import InfrastructureSection from './components/sections/InfrastructureSection'
import WhatIsInfra from './components/sections/WhatIsInfra'
import ComponentsSection from './components/sections/ComponentsSection'
import WhyBusinessSection from './components/sections/WhyBusinessSection'
import JobRolesSection from './components/sections/JobRolesSection'
import RoadmapSection from './components/sections/RoadmapSection'
import MentorSection from './components/sections/MentorSection'
import WebinarSection from './components/sections/WebinarSection'
import FaqSection from './components/sections/FaqSection'
import Footer from './components/layout/Footer'
import LeadModal from './components/ui/LeadModal'
import BenefitsModal from './components/ui/BenefitsModal'
import WhatsAppFloat from './components/ui/WhatsAppFloat'

import AnnouncementBar from './components/layout/AnnouncementBar'

function App() {
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-[100] flex flex-col w-full">
        <Navbar />
        <AnnouncementBar />
      </header>

      <main className="pt-[86px] md:pt-[114px]">
        <div id="hero"><HeroSection /></div>
        <div id="demand"><DemandSection /></div>
        <InfrastructureSection />
        <WhatIsInfra />
        <WhyBusinessSection />
        <JobRolesSection />
        <div id="roadmap"><RoadmapSection /></div>
        <ComponentsSection />
        <MentorSection />
        <div id="webinar"><WebinarSection /></div>
        <FaqSection />
        <Footer />
      </main>
      <LeadModal />
      <BenefitsModal />
      <WhatsAppFloat />
    </div>
  )
}

export default App