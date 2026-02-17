import { Box, Typography } from '@mui/material';

const copyrightDate = new Date().getFullYear();

const Footer = () => {
  return (
    <Box textAlign='center' mb={2}>
      <Typography>
        &copy; {copyrightDate} Chapter Two. All Rights Reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
