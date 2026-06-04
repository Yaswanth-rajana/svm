import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/globals.css'
import LandingPage from './pages/LandingPage.jsx'
import PaymentSuccess from './pages/PaymentSuccess.jsx'
import PaymentFailed from './pages/PaymentFailed.jsx'
import ClaimCertificate from './pages/ClaimCertificate.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage program="it-infrastructure" />} />
        <Route path="/cloud-computing" element={<LandingPage program="cloud-computing" />} />
        <Route path="/devops-engineering" element={<LandingPage program="devops-engineering" />} />
        <Route path="/virtualization-engineering" element={<LandingPage program="virtualization-engineering" />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />
        <Route path="/claim-certificate" element={<ClaimCertificate />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
