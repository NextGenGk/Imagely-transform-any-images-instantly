import HeroSection_05 from '@/components/ui/hero-section-with-gradient';
import Features from '@/components/marketing/Features';
import UseCasesSection from '@/components/marketing/UseCasesSection';
import PricingSection from '@/components/marketing/PricingSection';
import TestimonialSection from '@/components/marketing/TestimonialSection';
import FooterSection from '@/components/marketing/FooterSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Imagely - Transform Images with Natural Language",
  description: "Upload an image, type what you want to do, and let AI handle the rest. Resize, convert formats, remove backgrounds, and enhance with zero technical skills required.",
  openGraph: {
    title: "Imagely - Transform Images with Natural Language",
    description: "Upload an image, type what you want to do, and let AI handle the rest.",
  }
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection_05 />
      <Features />
      <UseCasesSection />
      <PricingSection />
      <TestimonialSection />
      <FooterSection />
    </main>
  );
}
