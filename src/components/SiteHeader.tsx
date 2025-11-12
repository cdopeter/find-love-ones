'use client';

import * as React from 'react';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DashboardIcon from '@mui/icons-material/Dashboard';

const OPD_LOGO_URL = 'https://opd.gov.jm/wp-content/uploads/2020/07/logo-2020.png';

const pages = [
  { label: 'Home', href: '/', icon: HomeIcon },
  { label: 'Submit Request', href: '/request', icon: AddIcon },
  { label: 'Search', href: '/dashboard', icon: SearchIcon },
  { label: 'Tracker', href: '/tracker', icon: DashboardIcon },
];

function SiteHeader() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar
      position="absolute"
      elevation={0}
      sx={{
        backgroundColor: 'transparent',
        backdropFilter: 'blur(0.5px)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              mr: 2,
            }}
          >
            <Box
              component="img"
              src={OPD_LOGO_URL}
              alt="Office of the Public Defender Logo"
              sx={{
                mr: 1,
                height: 40,
                width: 'auto',
                objectFit: 'contain',
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="h6"
                component={Link}
                href="/"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  textDecoration: 'none',
                  lineHeight: 1.2,
                }}
              >
                Proof Of Wellness
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'primary.main',
                  fontSize: '0.7rem',
                  lineHeight: 1.2,
                }}
              >
                Powered By The Office of The Public Defender
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="navigation menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              sx={{ color: 'white' }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => {
                const IconComponent = page.icon;
                return (
                  <MenuItem
                    key={page.label}
                    onClick={handleCloseNavMenu}
                    component={Link}
                    href={page.href}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <IconComponent sx={{ fontSize: 20 }} />
                    <Typography sx={{ textAlign: 'center' }}>
                      {page.label}
                    </Typography>
                  </MenuItem>
                );
              })}
            </Menu>
          </Box>
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              flexGrow: 1,
            }}
          >
            <Box
              component="img"
              src={OPD_LOGO_URL}
              alt="Office of the Public Defender Logo"
              sx={{
                mr: 1,
                height: 32,
                width: 'auto',
                objectFit: 'contain',
              }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="h6"
                component={Link}
                href="/"
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  lineHeight: 1.2,
                }}
              >
                Proof Of Wellness
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'white',
                  fontSize: '0.6rem',
                  lineHeight: 1.2,
                }}
              >
                Powered By The Office of The Public Defender
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'flex-end',
            }}
          >
            {pages.map((page) => {
              const IconComponent = page.icon;
              return (
                <Button
                  key={page.label}
                  component={Link}
                  href={page.href}
                  onClick={handleCloseNavMenu}
                  startIcon={<IconComponent />}
                  sx={{
                    my: 2,
                    color: 'white',
                    display: 'flex',
                    fontWeight: 600,
                    '&:focus': {
                      outline: '2px solid white',
                      outlineOffset: '2px',
                    },
                  }}
                >
                  {page.label}
                </Button>
              );
            })}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default SiteHeader;
