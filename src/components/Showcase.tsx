'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { tokens } from '@/theme';

export default function Showcase() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: tokens.colors.bg,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Wide Gradient Card with Portrait */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card
              sx={{
                height: { xs: 500, md: 500 },
                boxShadow: tokens.shadows.large,
                borderRadius: `${tokens.radii.card}px`,
                position: 'relative',
                overflow: 'hidden',
                backgroundImage: 'url(/hero/volunteer.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  outlineOffset: '4px',
                  background: `linear-gradient(135deg, ${tokens.colors.primary}85 0%, ${tokens.colors.text} 60%, ${tokens.colors.text} 80%)`,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                },
                
                '&:focus-within': {
                  outline: `3px solid ${tokens.colors.primary}`,
                  outlineOffset: '4px',
                },
              }}
            >
              <CardContent
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  p: { xs: 3, md: 4 },
                  pr: 0,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <Typography
                  variant="h2"
                  component="h3"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    mb: 2,
                    textShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'translateY(8px)',
                    opacity: 0.9,
                    '.MuiCard-root:hover &': {
                      transform: 'translateY(0px)',
                      opacity: 1,
                      textShadow: '0px 4px 12px rgba(0, 0, 0, 0.4)',
                    },
                  }}
                >
                  {`Together, We're Protecting Lives and Upholding Dignity`}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'white',
                    fontSize: 18,
                    lineHeight: 1.6,
                    maxWidth: '800px',
                    textShadow: '0px 1px 4px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'translateY(12px)',
                    opacity: 0.8,
                    '.MuiCard-root:hover &': {
                      transform: 'translateY(10px)',
                      opacity: 1,
                      textShadow: '0px 2px 8px rgba(0, 0, 0, 0.4)',
                    },
                  }}
                >
                  The Human Rights in Action campaign is a national relief and accountability initiative by the Office of the Public Defender. In the aftermath of Hurricane Melissa, many families have lost communication with their loved ones across Jamaica.
This platform allows Jamaicans at home and abroad to report missing persons, request welfare checks, and receive verified updates through official emergency channels.

                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Image Card with Moss - using gradient as placeholder */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                height: { xs: 400, md: 500 },
                boxShadow: tokens.shadows.large,
                borderRadius: `${tokens.radii.card}px`,
                position: 'relative',
                overflow: 'hidden',
                backgroundImage: 'url(/hero/volunteer-2.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                },

                '&:focus-within': {
                  outline: `3px solid ${tokens.colors.primary}`,
                  outlineOffset: '4px',
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background:
                    'linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 100%)',
                  p: 3,
                }}
              >
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  Growing Together
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
