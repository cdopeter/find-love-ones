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
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Wide Gradient Card with Portrait */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card
              sx={{
                height: { xs: 400, md: 500 },
                boxShadow: tokens.shadows.large,
                borderRadius: `${tokens.radii.card}px`,
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${tokens.colors.primary} 0%, ${tokens.colors.primaryLight} 100%)`,
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
                  p: 4,
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
                  }}
                >
                  Every Connection Matters
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'white',
                    fontSize: 18,
                    lineHeight: 1.6,
                    maxWidth: '600px',
                    textShadow: '0px 1px 4px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  In the aftermath of Hurricane Melissa, we work tirelessly to reunite
                  families and protect the dignity of every person.
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
                background: `linear-gradient(180deg, ${tokens.colors.primaryLight} 0%, ${tokens.colors.primary} 100%)`,
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
