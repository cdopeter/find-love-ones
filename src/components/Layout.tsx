'use client';

import Box from '@mui/material/Box';
import Navigation from './Navigation';
import Footer from './Footer';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Navigation />
      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}

export default Layout;
