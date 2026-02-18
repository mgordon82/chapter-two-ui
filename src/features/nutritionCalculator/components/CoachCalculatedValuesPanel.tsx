import { Paper, Stack, Typography, Divider } from '@mui/material';
import { Section } from '../../../components/sections/section';

type ResultRowProps = {
  label: string;
  value?: string | number | null;
  unit?: string;
  hint?: string;
};

type CoachCalculatedValuesPanelProps = {
  weightGoalLabel: string | null;
  bmr: number | null;
  tdee: number | null;
};

const ResultRow = ({ label, value, unit, hint }: ResultRowProps) => (
  <Stack spacing={0.5}>
    <Stack direction='row' justifyContent='space-between' alignItems='baseline'>
      <Typography variant='body2' color='text.secondary'>
        {label}
      </Typography>
      <Typography variant='subtitle1' fontWeight={600}>
        {value ?? '—'}
        {unit ? ` ${unit}` : ''}
      </Typography>
    </Stack>
    {hint ? (
      <Typography variant='caption' color='text.secondary'>
        {hint}
      </Typography>
    ) : null}
  </Stack>
);

export const CoachCalculatedValuesPanel = ({
  weightGoalLabel,
  bmr,
  tdee
}: CoachCalculatedValuesPanelProps) => {
  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 2 },
        borderRadius: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        width: 380
      }}
    >
      <Typography variant='h6' mb={2}>
        Calculated Values
      </Typography>

      <Stack spacing={2.5}>
        <Section title='Goal Summary'>
          <ResultRow label='Weight Goal' value={weightGoalLabel} />
        </Section>

        <Divider />

        <Section title='Metabolism'>
          <ResultRow
            label='BMR'
            value={bmr}
            unit='kcal/day'
            hint='Basal metabolic rate'
          />
          <ResultRow
            label='TDEE'
            value={tdee}
            unit='kcal/day'
            hint='Estimated daily energy expenditure'
          />
        </Section>

        <Divider />

        <Section title='Plan Targets'>
          <ResultRow label='Ideal Loss Per Week' value='—' unit='kg' />
          <ResultRow label='Ideal Loss Per Week' value='—' unit='%' />
          <ResultRow label='Targeted Deficit' value='—' unit='kcal/day' />
          <ResultRow label='Daily Calorie Deficit' value='—' unit='kcal/day' />
        </Section>

        <Divider />

        <Section title='Daily Targets'>
          <ResultRow label='Daily Calories' value='—' unit='kcal' />
          <ResultRow label='Daily Protein' value='—' unit='g' />
          <ResultRow label='Daily Carbs' value='—' unit='g' />
          <ResultRow label='Daily Fats' value='—' unit='g' />
        </Section>
      </Stack>
    </Paper>
  );
};
