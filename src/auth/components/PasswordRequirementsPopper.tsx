import React from 'react';
import { Paper, Popper, Box, Typography } from '@mui/material';
import PasswordRequirements from './PasswordRequirements';
import type { PasswordRuleResult } from '../helpers/passwordPolicy';

type Props = {
  anchorEl: HTMLElement | null;
  open: boolean;
  rules: PasswordRuleResult[];
  title?: string;
};

const PasswordRequirementsPopper: React.FC<Props> = ({
  anchorEl,
  open,
  rules,
  title = 'Password must include:'
}) => {
  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement='bottom-start'
      sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
      modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
    >
      <Paper elevation={10} sx={{ p: 1.25, width: 340, borderRadius: 2 }}>
        <Typography variant='body2' sx={{ fontWeight: 700, mb: 0.75 }}>
          {title}
        </Typography>
        <Box>
          <PasswordRequirements rules={rules} title='' />
        </Box>
      </Paper>
    </Popper>
  );
};

export default PasswordRequirementsPopper;
