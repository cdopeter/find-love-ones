'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
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
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'center', sm: 'flex-start' }}
          spacing={2}
        >
          <Typography variant="body2" align="center">
            Office of the Public Defender - Human Rights in Action
          </Typography>
          <Typography variant="body2" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' | '}
            <Link
              href="mailto:enquiries@opd.gov.jm"
              color="inherit"
              underline="hover"
            >
              enquiries@opd.gov.jm
            </Link>
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

export default Footer;
