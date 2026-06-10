import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal',
  description: 'Legal information and policies for Imagely.',
  robots: {
    index: true,
    follow: true,
  }
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
