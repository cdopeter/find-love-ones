'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GroupsIcon from '@mui/icons-material/Groups';
import { tokens } from '@/theme';

export default function FeatureGrid() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: tokens.colors.bg,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          component="h2"
          align="center"
          sx={{
            mb: 6,
            color: tokens.colors.text,
            fontWeight: 600,
          }}
        >
          Through Pixel and Code
        </Typography>

        <Grid container spacing={4}>
          {/* Top Row - 3 Cards */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                height: '100%',
                boxShadow: tokens.shadows.large,
                borderRadius: `${tokens.radii.card}px`,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow:
                    '0px 12px 32px rgba(0, 0, 0, 0.12), 0px 4px 12px rgba(0, 0, 0, 0.08)',
                },
                '&:focus-within': {
                  outline: `3px solid ${tokens.colors.primary}`,
                  outlineOffset: '4px',
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <PersonSearchIcon
                    sx={{
                      fontSize: 48,
                      mr: 2,
                      color: tokens.colors.primary,
                    }}
                    aria-hidden="true"
                  />
                  <Typography variant="h5" component="h3" fontWeight={600}>
                    Report Missing Persons
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{ color: 'text.secondary', lineHeight: 1.75 }}
                >
                  Submit detailed reports about missing loved ones to help our
                  emergency response teams locate and verify their safety.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                height: '100%',
                boxShadow: tokens.shadows.large,
                borderRadius: `${tokens.radii.card}px`,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow:
                    '0px 12px 32px rgba(0, 0, 0, 0.12), 0px 4px 12px rgba(0, 0, 0, 0.08)',
                },
                '&:focus-within': {
                  outline: `3px solid ${tokens.colors.primary}`,
                  outlineOffset: '4px',
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <VerifiedUserIcon
                    sx={{
                      fontSize: 48,
                      mr: 2,
                      color: tokens.colors.primary,
                    }}
                    aria-hidden="true"
                  />
                  <Typography variant="h5" component="h3" fontWeight={600}>
                    Verified Updates
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{ color: 'text.secondary', lineHeight: 1.75 }}
                >
                  Receive official, verified information through our partnership
                  with ODPEM and Jamaica&apos;s emergency response agencies.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                height: '100%',
                boxShadow: tokens.shadows.large,
                borderRadius: `${tokens.radii.card}px`,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow:
                    '0px 12px 32px rgba(0, 0, 0, 0.12), 0px 4px 12px rgba(0, 0, 0, 0.08)',
                },
                '&:focus-within': {
                  outline: `3px solid ${tokens.colors.primary}`,
                  outlineOffset: '4px',
                },
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <GroupsIcon
                    sx={{
                      fontSize: 48,
                      mr: 2,
                      color: tokens.colors.primary,
                    }}
                    aria-hidden="true"
                  />
                  <Typography variant="h5" component="h3" fontWeight={600}>
                    Community Support
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{ color: 'text.secondary', lineHeight: 1.75 }}
                >
                  Connect with trusted response teams and community members
                  dedicated to reuniting families across Jamaica.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
