'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { tokens } from '@/theme';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        backgroundColor: tokens.colors.text,
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and Tagline Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2} alignItems={{ xs: 'center', md: 'flex-start' }}>
              <Box
                component="img"
                src="https://opd.gov.jm/wp-content/uploads/2020/07/logo-2020.png"
                alt="Office of the Public Defender Logo"
                sx={{
                  height: 80,
                  width: 'auto',
                  objectFit: 'contain',
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontStyle: 'italic',
                  textAlign: { xs: 'center', md: 'left' },
                }}
              >
                &ldquo;Voice of the voiceless, To lose the chains of
                injustice&rdquo;
              </Typography>
              <Typography
                variant="caption"
                sx={{ textAlign: { xs: 'center', md: 'left' } }}
              >
                {'© '}
                {new Date().getFullYear()}
                {' Powered By the Office of the Public Defender'}
              </Typography>
            </Stack>
          </Grid>

          {/* Contact Information Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EmailIcon fontSize="small" />
                <Link
                  href="mailto:enquiries@opd.gov.jm"
                  color="inherit"
                  underline="hover"
                  sx={{ fontSize: '0.875rem' }}
                >
                  enquiries@opd.gov.jm
                </Link>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <PhoneIcon fontSize="small" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="body2">
                    Hotline: +1 (888)-429-5673
                  </Typography>
                  <Typography variant="body2">
                    Local: (876) 922-7089 / 7090 / 7109 / 8256
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <LocationOnIcon fontSize="small" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="body2">22-24 Duke Street</Typography>
                  <Typography variant="body2">P.O. Box 695</Typography>
                  <Typography variant="body2">Kingston, Jamaica, W.I.</Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>

          {/* Partners and Social Media Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" gutterBottom>
              Our Partners
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              ODPEM and partner organizations
            </Typography>
            <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.12)' }} />
            <Typography variant="h6" gutterBottom>
              Follow Us
            </Typography>
            <Stack direction="row" spacing={1}>
              {/* TODO: Update with actual OPD social media URLs */}
              <IconButton
                aria-label="Facebook"
                component="a"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'white' }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                aria-label="Instagram"
                component="a"
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'white' }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                aria-label="Twitter"
                component="a"
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'white' }}
              >
                <TwitterIcon />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Footer;
