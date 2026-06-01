// Full landing page container.

import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="pt-16">
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
