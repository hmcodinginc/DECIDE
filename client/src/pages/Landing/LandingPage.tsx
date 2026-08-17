import { useEffect } from "react";
import { ExamplesSection } from "@/components/landing/ExamplesSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { WhySection } from "@/components/landing/WhySection";
import { track } from "@/services/analytics/events";
import { usePageTitle } from "@/hooks/usePageTitle";

function LandingPage() {
  usePageTitle("DECIDE — Stop Comparing. Get a Decision.");
  useEffect(() => {
    void track("landing_view");
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "DECIDE",
    url: "https://decide.hmcoding.com",
    description:
      "DECIDE helps you choose between options based on your priorities, budget, and constraints.",
    applicationCategory: "LifestyleApplication",
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "0",
      highPrice: "2000",
      priceCurrency: "INR",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <ExamplesSection />
      <HowItWorksSection />
      <WhySection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}

export { LandingPage };
