import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';

type MediaTypes = {
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  imageRightOnDisplay?: boolean;
  buttonLabel?: string;
  buttonHref?: string;
};

const MediaSection: React.FC<MediaTypes> = ({
  title,
  subtitle,
  image,
  imageAlt,
  imageRightOnDisplay = false,
  buttonLabel,
  buttonHref
}) => {
  const desktopTextOrder = imageRightOnDisplay ? 1 : 2;
  const desktopImageOrder = imageRightOnDisplay ? 2 : 1;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2 },
        borderRadius: 1,
        backgroundColor: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <Stack
        justifyContent='space-between'
        alignItems='center'
        direction={{ xs: 'column', md: 'row' }}
        gap={10}
      >
        <Stack
          width={{ xs: '100%', md: 500 }}
          order={{ xs: 2, md: desktopTextOrder }}
        >
          <Typography
            component='h2'
            variant='h4'
            fontWeight={700}
            letterSpacing='0.5'
            textTransform='uppercase'
          >
            {title}
          </Typography>

          <Typography textTransform='uppercase' my={5}>
            {subtitle}
          </Typography>

          {buttonLabel && buttonHref && (
            <Button
              variant='contained'
              href={buttonHref}
              target='_blank'
              rel='noreferrer'
            >
              {buttonLabel}
            </Button>
          )}
        </Stack>

        <Stack order={{ xs: 1, md: desktopImageOrder }}>
          <Box
            component='img'
            src={image}
            alt={imageAlt ?? ''}
            sx={{
              width: { xs: '100%', sm: 450 },
              maxWidth: 500,
              height: 'auto',
              borderRadius: 1,
              display: 'block'
            }}
          />
        </Stack>
      </Stack>
    </Paper>
  );
};

export default MediaSection;
