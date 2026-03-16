import React from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import type { CoachNotes } from '../types';

type CoachNotesCardProps = {
  notes: CoachNotes;
};

const formatDate = (value: string | null) => {
  if (!value) return '—';

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const CoachNotesCard: React.FC<CoachNotesCardProps> = ({ notes }) => {
  const noteText = notes.currentNote?.trim();
  const updatedBy = notes.updatedBy?.fullName ?? null;
  const updatedAt = notes.updatedAt ?? null;

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              border: '1px solid'
            }}
          >
            <EditOutlinedIcon fontSize='small' />
          </Box>
          <Typography variant='h6' fontWeight={700}>
            Coach Notes
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant='body2' color='text.secondary' lineHeight={1.7}>
            {noteText || 'No coach notes yet.'}
          </Typography>

          {(updatedBy || updatedAt) && (
            <Typography variant='caption' color='text.secondary'>
              Last updated {updatedAt ? formatDate(updatedAt) : '—'}
              {updatedBy ? ` by ${updatedBy}` : ''}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CoachNotesCard;
