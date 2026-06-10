import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Image',
  description: 'Upload your image for AI processing.',
  robots: {
    index: false,
    follow: false,
  }
};

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
