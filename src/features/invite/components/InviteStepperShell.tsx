import { Box, Button, LinearProgress, Stack, Typography } from '@mui/material';

type InviteStepperShellProps = {
  activeStep: number;
  totalSteps: number;
  stepLabel: string;
  children: React.ReactNode;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
};

const InviteStepperShell = ({
  activeStep,
  totalSteps,
  stepLabel,
  children,
  onBack,
  onNext,
  nextDisabled = false
}: InviteStepperShellProps) => {
  const progress = ((activeStep + 1) / totalSteps) * 100;

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant='overline' sx={{ opacity: 0.75 }}>
          Step {activeStep + 1} of {totalSteps}
        </Typography>
        <Typography variant='h5' fontWeight={700}>
          {stepLabel}
        </Typography>
        <LinearProgress variant='determinate' value={progress} />
      </Stack>

      <Box>{children}</Box>

      <Stack direction='row' justifyContent='space-between'>
        <Button disabled={activeStep === 0} onClick={onBack}>
          Back
        </Button>

        <Button variant='contained' onClick={onNext} disabled={nextDisabled}>
          {activeStep === totalSteps - 1 ? 'Finish' : 'Next'}
        </Button>
      </Stack>
    </Stack>
  );
};

export default InviteStepperShell;
