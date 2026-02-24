import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import type { PasswordRuleResult } from '../helpers/passwordPolicy'; // adjust path if needed

type Props = {
  rules: PasswordRuleResult[];
  title?: string;
};

const PasswordRequirements: React.FC<Props> = ({
  rules,
  title = 'Password must include:'
}) => {
  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant='body2' sx={{ mb: 0.75, fontWeight: 600 }}>
        {title}
      </Typography>

      <Stack spacing={0.5}>
        {rules.map((r) => {
          const color = r.passed ? 'success.main' : 'text.secondary';

          return (
            <Stack
              key={r.key}
              direction='row'
              spacing={1}
              alignItems='center'
              sx={{ color }}
            >
              {r.passed ? (
                <CheckCircleOutlineIcon fontSize='small' color='success' />
              ) : (
                <HighlightOffIcon fontSize='small' color='disabled' />
              )}

              <Typography variant='body2' sx={{ color }}>
                {r.label}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
};

export default PasswordRequirements;
