import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import coachPhoto from '../../../assets/photos/coach/image02.jpg';
import jackPhoto from '../../../assets/photos/clients/jack.jpg';
import ryanPhoto from '../../../assets/photos/clients/ryan.jpg';
import MediaSection from '../../../components/sections/mediaSection';

const LandingPage: React.FC = () => {
  return (
    <Box>
      <Typography
        variant='h3'
        component='h1'
        fontWeight={700}
        mb={4}
        sx={{
          letterSpacing: 0.5,
          textTransform: 'uppercase'
        }}
        color='text.secondary'
      >
        Chapter Two
      </Typography>

      <Stack gap={10}>
        <MediaSection
          title='Your Dream Body Awaits'
          subtitle='Learn exactly how to turn your fitness around in a matter of
              months before summer'
          image={coachPhoto}
          imageAlt='photo of coach'
          buttonLabel='Claim Your Guide Here'
          buttonHref='https://docs.google.com/forms/d/e/1FAIpQLSdsoyPwSG6-d0wgFzYvCzzmHKNlUYdKeXa0jjKgvWxovm3N8A/viewform?usp=header'
          imageRightOnDisplay
        />

        <Stack
          justifyContent='space-between'
          alignItems='center'
          direction={{ xs: 'column', md: 'row' }}
        >
          <Stack width={{ xs: '100%', md: 500 }}>
            <Typography
              component='h2'
              variant='h4'
              fontWeight={700}
              letterSpacing='0.5'
              textTransform='uppercase'
            >
              1-1 COACHING FOR GUARANTEED RESULTS
            </Typography>
            <Typography textTransform='uppercase' my={5}>
              To achieve results like Jack & Ryan below
            </Typography>
          </Stack>

          <Stack width={{ xs: '100%', md: 500 }}>
            <Button
              variant='contained'
              color='secondary'
              href='https://calendly.com/alec-chtwo/30min'
              target='_blank'
            >
              Apply Today
            </Button>
          </Stack>
        </Stack>

        <MediaSection
          title='Meet Jack'
          subtitle='From complete beginner unable to string together a routine, to
              completely reshaping his body in 6 months'
          image={jackPhoto}
          imageAlt='photo of jack'
        />

        <MediaSection
          title='Meet Ryan'
          subtitle='From serious health conditions, low self-confidence and no
              direction, to losing 80kg and regaining his mojo in a single year'
          image={ryanPhoto}
          imageAlt='photo of ryan'
          imageRightOnDisplay
        />
      </Stack>
    </Box>
  );
};

export default LandingPage;
