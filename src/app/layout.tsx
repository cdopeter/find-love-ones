import type { Metadata } from 'next';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import Layout from '@/components/Layout';

export const metadata: Metadata = {
  title: 'HopeNet - Find Your Loved Ones',
  description:
    'A community-powered platform that helps families and organizations locate missing loved ones after natural disasters.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider>
          <Layout>{children}</Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}
