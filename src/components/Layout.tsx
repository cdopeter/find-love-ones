'use client';

import Box from '@mui/material/Box';
import Navigation from './Navigation';
import Footer from './Footer';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {!isHomePage && <Navigation />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: isHomePage ? 0 : 4,
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
}

export default Layout;
