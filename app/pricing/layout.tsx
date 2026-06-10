import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for AI image processing. Start for free and upgrade as you grow. Pay only for what you use.',
  openGraph: {
    title: 'Imagely Pricing - Simple & Transparent',
    description: 'Start for free and upgrade as you grow. Pay only for what you use.',
  }
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
