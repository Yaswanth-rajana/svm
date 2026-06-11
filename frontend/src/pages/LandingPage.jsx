import { useEffect } from 'react'
import Navbar from '../components/layout/Navbar'
import HeroSection from '../components/sections/HeroSection'
import DemandSection from '../components/sections/DemandSection'
import { programsContent } from '../data/content'
import InfrastructureSection from '../components/sections/InfrastructureSection'
import WhatIsInfra from '../components/sections/WhatIsInfra'
import ComponentsSection from '../components/sections/ComponentsSection'
import WhyBusinessSection from '../components/sections/WhyBusinessSection'
import JobRolesSection from '../components/sections/JobRolesSection'
import RoadmapSection from '../components/sections/RoadmapSection'
import MentorSection from '../components/sections/MentorSection'
import WebinarSection from '../components/sections/WebinarSection'
import FaqSection from '../components/sections/FaqSection'
import Footer from '../components/layout/Footer'
import LeadModal from '../components/ui/LeadModal'
import BenefitsModal from '../components/ui/BenefitsModal'
import WhatsAppFloat from '../components/ui/WhatsAppFloat'
import AnnouncementBar from '../components/layout/AnnouncementBar'

function LandingPage({ program = 'it-infrastructure' }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    const programKey = program === 'it-infrastructure' ? 'infrastructure' : program;
    const programData = programsContent[programKey] || programsContent.infrastructure;
    const title = programData.meta?.title || `${programData.shortTitle} Training | SMVEN`;
    const description = programData.meta?.description || `Master ${programData.shortTitle} engineering with SMVEN.`;

    document.title = title;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;
  }, [program]);

  return (
    <div className="min-h-screen" key={program}>
      <header className="fixed top-0 left-0 right-0 z-[100] flex flex-col w-full">
        <Navbar />
        <AnnouncementBar />
      </header>

      <main className="pt-[86px] md:pt-[114px]">
        <div id="hero"><HeroSection program={program} /></div>
        {(program === 'infrastructure' || program === 'it-infrastructure') && (
          <div id="demand"><DemandSection program={program} /></div>
        )}
        <InfrastructureSection program={program} />
        <WhatIsInfra program={program} />
        <WhyBusinessSection program={program} />
        <JobRolesSection program={program} />
        <div id="roadmap"><RoadmapSection program={program} /></div>
        <ComponentsSection program={program} />
        <MentorSection program={program} />
        <div id="webinar"><WebinarSection program={program} /></div>
        <FaqSection program={program} />
        <Footer />
      </main>
      <LeadModal program={program} />
      <BenefitsModal program={program} />
      <WhatsAppFloat />
    </div>
  )
}

export default LandingPage
