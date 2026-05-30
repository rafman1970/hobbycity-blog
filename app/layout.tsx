import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HobbyCity Blog — Tips, Guides & Hobby Inspiration',
  description: 'Painting guides, assembly tutorials, hobby tips and instructional videos from the HobbyCity NZ team.',
  openGraph: {
    siteName: 'HobbyCity Blog',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
