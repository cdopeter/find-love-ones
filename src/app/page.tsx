'use client';

import Link from 'next/link';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GroupsIcon from '@mui/icons-material/Groups';

export default function Home() {
  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          my: 6,
          textAlign: 'center',
          py: 8,
          px: 3,
          background: 'linear-gradient(135deg, rgba(0,71,125,0.05) 0%, rgba(255,215,0,0.05) 100%)',
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '2rem', md: '3.5rem' },
            color: 'primary.main',
          }}
        >
          Human Rights in Action: Helping Jamaicans Reconnect After Hurricane
          Melissa
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          paragraph
          sx={{
            mt: 3,
            mb: 4,
            maxWidth: '900px',
            mx: 'auto',
            lineHeight: 1.8,
          }}
        >
          In times of crisis, every voice matters. The Office of the Public
          Defender, in partnership with ODPEM and Jamaica&apos;s emergency
          response agencies, is working to reunite families, protect rights, and
          restore hope.
        </Typography>
        <Button
          component={Link}
          href="/request"
          variant="contained"
          size="large"
          sx={{
            py: 2,
            px: 5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
            },
          }}
        >
          Submit a Missing Person Report
        </Button>
      </Box>

      {/* About Section */}
      <Box id="about" sx={{ my: 8 }}>
        <Typography
          variant="h3"
          gutterBottom
          align="center"
          sx={{ fontWeight: 'bold', mb: 4, color: 'primary.main' }}
        >
          Together, We&apos;re Protecting Lives and Upholding Dignity
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ fontSize: '1.1rem', lineHeight: 1.8, mb: 3 }}
        >
          The Human Rights in Action campaign is a national relief and
          accountability initiative by the Office of the Public Defender. In the
          aftermath of Hurricane Melissa, many families have lost communication
          with their loved ones across Jamaica.
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ fontSize: '1.1rem', lineHeight: 1.8, mb: 3 }}
        >
          This platform allows Jamaicans at home and abroad to report missing
          persons, request welfare checks, and receive verified updates through
          official emergency channels.
        </Typography>
        <Typography
          variant="body1"
          sx={{ fontSize: '1.1rem', lineHeight: 1.8, fontWeight: 500 }}
        >
          Our goal: to ensure that every person&apos;s safety, rights, and
          dignity are respected — even in the hardest of times.
        </Typography>
      </Box>

      {/* Features Grid */}
      <Grid container spacing={4} sx={{ my: 6 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: '100%',
              boxShadow: 3,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonSearchIcon
                  color="primary"
                  sx={{ fontSize: 50, mr: 2 }}
                />
                <Typography variant="h5" component="h2" fontWeight="bold">
                  Report Missing Persons
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
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
              boxShadow: 3,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <VerifiedUserIcon
                  color="primary"
                  sx={{ fontSize: 50, mr: 2 }}
                />
                <Typography variant="h5" component="h2" fontWeight="bold">
                  Verified Updates
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
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
              boxShadow: 3,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <GroupsIcon color="primary" sx={{ fontSize: 50, mr: 2 }} />
                <Typography variant="h5" component="h2" fontWeight="bold">
                  Community Support
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                Connect with trusted response teams and community members
                dedicated to reuniting families across Jamaica.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
