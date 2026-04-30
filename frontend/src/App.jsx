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

import AnnouncementBar from './components/layout/AnnouncementBar'

function App() {
  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-[100] flex flex-col w-full">
        <Navbar />
        <AnnouncementBar />
      </div>
      <div id="hero"><HeroSection /></div>
      <div id="demand"><DemandSection /></div>
      <InfrastructureSection />
      <WhatIsInfra />
      <ComponentsSection />
      <WhyBusinessSection />
      <JobRolesSection />
      <div id="roadmap"><RoadmapSection /></div>
      <MentorSection />
      <div id="webinar"><WebinarSection /></div>
      <FaqSection />
      <Footer />
      <LeadModal />
    </div>
  )
}

export default App