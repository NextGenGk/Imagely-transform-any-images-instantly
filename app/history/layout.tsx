import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'History',
  description: 'View your previously processed images.',
  robots: {
    index: false,
    follow: false,
  }
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
