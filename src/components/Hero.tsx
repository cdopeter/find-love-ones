'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Link from 'next/link';
import { tokens } from '@/theme';

export default function Hero() {
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        minHeight: { xs: '100vh', md: '90vh' },
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: tokens.colors.bg,

        '@media (prefers-reduced-motion: reduce)': {
          '& *': {
            animation: 'none !important',
            transition: 'none !important',
          },
        },
      }}
    >
      {/* Hero Image with Green Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: { xs: '100%', md: '50%' },
          zIndex: 0,
          backgroundImage: 'url(/hero/hands-together-unity.jpg)',
          backgroundSize: 'cover',
          borderBottomLeftRadius: { xs: 0, md: tokens.radii.heroContainer },
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderBottomLeftRadius: { xs: 0, md: tokens.radii.heroContainer },
            background: `linear-gradient(135deg, ${tokens.colors.primary}40 0%, ${tokens.colors.primary}60 100%)`,
          },
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 2,
          py: { xs: 12, md: 8, },
          ml: {xs: 0, md: 0, lg: 1, xl:10}
        }}
      >
        <Box
          sx={{
            maxWidth: { xs: '100%', md: '50%' },
            backgroundColor: { xs: 'rgba(246, 248, 245, 0.95)', md: 'transparent' },
            borderRadius: { xs: tokens.radii.heroContainer / 8, md: 0 },
            p: { xs: 3, md: 0, },
          }}
        >
          <Typography
            component="h1"
            variant="h1"
            sx={{
              color: tokens.colors.text,
              mb: 3,
              fontWeight: 600,
            }}
          >
            Human Rights in Action: Helping Jamaicans Reconnect After Hurricane Melissa
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: tokens.colors.text,
              mb: 4,
              fontSize: { xs: 16, md: 20 },
              lineHeight: 1.6,
              opacity: 0.9,
            }}
          >
            In times of crisis, every voice matters. The Office of the Public Defender, 
            in partnership with ODPEM and Jamaica’s emergency response agencies, 
            is working to reunite families, protect rights, and restore hope.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/request"
              variant="contained"
              size="large"
              sx={{
                py: { xs: 1.5, md: 2 },
                px: { xs: 3, md: 4 },
                fontSize: { xs: 16, md: 18 },
                fontWeight: 600,
                boxShadow: tokens.shadows.large,
                '&:hover': {
                  boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.12), 0px 4px 12px rgba(0, 0, 0, 0.08)',
                },
                '&:focus': {
                  outline: `3px solid ${tokens.colors.primary}`,
                  outlineOffset: '4px',
                },
              }}
            >
              Submit a Missing Person Report
            </Button>
            <KeyboardArrowDownIcon
              sx={{
                color: tokens.colors.primary,
                fontSize: 40,
                animation: 'bounce 2s infinite',
                '@keyframes bounce': {
                  '0%, 100%': {
                    transform: 'translateY(0)',
                  },
                  '50%': {
                    transform: 'translateY(8px)',
                  },
                },
              }}
              aria-hidden="true"
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
