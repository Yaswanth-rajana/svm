import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
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
import { trackCourseViewContent } from '../utils/metaPixel'

function LandingPage({ program = 'it-infrastructure' }) {
  const location = useLocation();
  const lastTrackedProgram = useRef(null);

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

    // Track Meta Pixel ViewContent event for the 6 course detail pages
    if (lastTrackedProgram.current !== program) {
      lastTrackedProgram.current = program;
      trackCourseViewContent(program);
    }

    // Canonical URL configuration for the 7 public routes
    const canonicalMap = {
      '/': 'https://smven.com/',
      '/cloud-computing': 'https://smven.com/cloud-computing',
      '/devops-engineering': 'https://smven.com/devops-engineering',
      '/virtualization-engineering': 'https://smven.com/virtualization-engineering',
      '/server-engineering': 'https://smven.com/server-engineering',
      '/storage-engineering': 'https://smven.com/storage-engineering',
      '/backup-engineering': 'https://smven.com/backup-engineering',
    };

    const programToSlug = {
      'it-infrastructure': '/',
      'infrastructure': '/',
      'cloud-computing': '/cloud-computing',
      'devops-engineering': '/devops-engineering',
      'virtualization-engineering': '/virtualization-engineering',
      'server-engineering': '/server-engineering',
      'storage-engineering': '/storage-engineering',
      'backup-engineering': '/backup-engineering',
    };

    const rawPath = location.pathname || '/';
    const normalizedPath = rawPath.length > 1 && rawPath.endsWith('/') ? rawPath.slice(0, -1) : rawPath;
    const targetPath = canonicalMap[normalizedPath] ? normalizedPath : (programToSlug[program] || '/');
    const canonicalUrl = canonicalMap[targetPath] || 'https://smven.com/';

    // Update or create exactly one self-referencing canonical tag in <head>
    const existingCanonicals = document.querySelectorAll('link[rel="canonical"]');
    let canonicalTag = null;
    if (existingCanonicals.length > 0) {
      canonicalTag = existingCanonicals[0];
      // Remove any duplicate canonical tags if present
      for (let i = 1; i < existingCanonicals.length; i++) {
        existingCanonicals[i].remove();
      }
    } else {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonicalUrl);

    return () => {
      // Clean up canonical tag when navigating away from LandingPage
      const tag = document.querySelector('link[rel="canonical"]');
      if (tag) {
        tag.remove();
      }
    };
  }, [program, location.pathname]);

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
        <div id="program"><WebinarSection program={program} /></div>
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
