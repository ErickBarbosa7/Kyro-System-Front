import './LandingPage.css';
import { LandingFooter } from '../LandingFooter/LandingFooter';
import { HeroSection } from '../HeroSection/HeroSection';
import { StatsBar } from '../StatsBar/StatsBar';
import { ModulesSection } from '../ModulesSection/ModulesSection';
import { CtaSection } from '../CtaSection/CtaSection';
import { FeatureCards } from '../FeatureCards/FeatureCards.';
import { LandingNavbar } from '../LandingNavbar/LandingNavbar';

export const LandingPage = () => (
    <div className="landing-layout">
        <LandingNavbar />
        <HeroSection />
        <StatsBar />
        <FeatureCards />
        <ModulesSection />
        <CtaSection />
        <LandingFooter />
    </div>
);