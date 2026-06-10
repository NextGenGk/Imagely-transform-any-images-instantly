import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about Imagely, AI image processing, file formats, batch processing, and subscriptions.',
  openGraph: {
    title: 'Imagely FAQ',
    description: 'Find answers to common questions about Imagely, AI image processing, file formats, and more.',
  }
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
