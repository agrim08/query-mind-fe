import type { Metadata } from "next";
import { AskAnything } from "@/components/landing/AskAnything";
import { DesignerSection } from "@/components/landing/DesignerSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCta } from "@/components/landing/FinalCta";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingNav } from "@/components/landing/LandingNav";
import { PricingSection } from "@/components/landing/PricingSection";
import { SafetySection } from "@/components/landing/SafetySection";

// Title, description, Open Graph and Twitter tags come from app/layout.tsx (lib/site.ts).
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-canvas text-fg">
      <LandingNav />
      <main>
        <Hero />
        <AskAnything />
        <HowItWorks />
        <SafetySection />
        <DesignerSection />
        <PricingSection />
        <FaqSection />
      </main>
      <FinalCta />
    </div>
  );
}
