import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

const Header: React.FC = () => {
  return (
    <AppBar
      position='sticky'
      elevation={0}
      color='transparent'
      sx={{
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper'
      }}
    >
      <Toolbar sx={{ px: 0, minHeight: 64 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant='h5'
            fontWeight={700}
            sx={{
              letterSpacing: 0.5
            }}
          >
            Chapter Two
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Expanding the adventure of <em>your</em> story
          </Typography>
        </Box>
        {/* nav items or user avatar here later */}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
