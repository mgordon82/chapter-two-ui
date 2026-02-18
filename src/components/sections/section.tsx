import { Stack, Typography } from '@mui/material';

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

export const Section = ({ title, children }: SectionProps) => (
  <Stack spacing={1.5}>
    <Typography variant='subtitle2' fontWeight={700}>
      {title}
    </Typography>
    {children}
  </Stack>
);
