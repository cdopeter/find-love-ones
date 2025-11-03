'use client';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PeopleIcon from '@mui/icons-material/People';

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          align="center"
          sx={{ fontWeight: 'bold' }}
        >
          Welcome to HopeNet
        </Typography>
        <Typography
          variant="h5"
          align="center"
          color="text.secondary"
          paragraph
        >
          A community-powered platform helping families reunite after natural
          disasters
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button variant="contained" size="large" startIcon={<SearchIcon />}>
            Search for Someone
          </Button>
          <Button variant="outlined" size="large" startIcon={<AddCircleIcon />}>
            Submit a Request
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SearchIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5" component="h2">
                  Search
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                Find information about missing loved ones using our
                comprehensive search database.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AddCircleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5" component="h2">
                  Submit
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                Submit search requests for missing family members or provide
                updates on found individuals.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5" component="h2">
                  Community
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                Connect with trusted response teams and community members
                working to reunite families.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6, p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          How It Works
        </Typography>
        <Typography variant="body1" paragraph>
          When natural disasters disrupt electricity, cell, and internet
          services, HopeNet provides a resilient communication channel. Our
          platform allows you to submit search requests for missing loved ones
          and receive verified updates from trusted response teams.
        </Typography>
        <Typography variant="body1">
          Whether you&apos;re searching for someone or providing information,
          HopeNet connects you with the resources and community support you need
          during difficult times.
        </Typography>
      </Box>
    </Container>
  );
}
