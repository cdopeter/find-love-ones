import type { Metadata } from 'next';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import Layout from '@/components/Layout';

export const metadata: Metadata = {
  title: 'Human Rights in Action - Office of the Public Defender Jamaica',
  description:
    'Helping Jamaicans reconnect after Hurricane Melissa. Report missing persons and receive verified updates through official emergency channels.',
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
