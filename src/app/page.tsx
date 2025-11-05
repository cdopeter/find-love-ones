'use client';

import Box from '@mui/material/Box';
import SiteHeader from '@/components/SiteHeader';
import Hero from '@/components/Hero';
import FeatureGrid from '@/components/FeatureGrid';
import Showcase from '@/components/Showcase';

export default function Home() {
  return (
    <Box>
      <SiteHeader />
      <Hero />
      <FeatureGrid />
      <Showcase />
    </Box>
  );
}
