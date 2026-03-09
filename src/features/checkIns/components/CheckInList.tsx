import { useState } from 'react';
import { Box, Stack, Typography, IconButton } from '@mui/material';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';

import { formatWeight } from '../helpers';
import type { UnitPrefType } from '../types';
import type { CheckIn } from '../redux/checkInsSlice';
import CheckInPhotosDialog from './CheckInPhotosDialog';

type CheckInListTypes = {
  filteredItems: CheckIn[];
  weightUnitPref: UnitPrefType;
};

type CheckInWithOptionalNotes = CheckIn & {
  notes?: string;
  metrics?: CheckIn['metrics'] & { notes?: string };
};

function getCheckInNotes(ci: CheckIn): string {
  const c = ci as CheckInWithOptionalNotes;
  const n1 = typeof c.notes === 'string' ? c.notes : '';
  const n2 = typeof c.metrics?.notes === 'string' ? c.metrics.notes : '';
  return (n1 || n2 || '').trim();
}

const CheckInList = ({ filteredItems, weightUnitPref }: CheckInListTypes) => {
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);

  if (filteredItems.length === 0) {
    return (
      <Typography variant='body2' color='text.secondary'>
        No check-ins in this range.
      </Typography>
    );
  }

  const items = filteredItems;

  return (
    <>
      <Stack
        spacing={0}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.10)',
          backgroundColor: 'rgba(255,255,255,0.03)'
        }}
      >
        {items.map((ci, idx) => {
          const notes = getCheckInNotes(ci);
          const hasNotes = notes.length > 0;
          const hasPhotos = Boolean(ci.hasPhotos && ci.photos?.photos?.length);

          const date = new Date(ci.recordedAt);
          const dateText = date.toLocaleDateString();

          const next = idx < items.length - 1 ? items[idx + 1] : null;
          const deltaKg = next
            ? ci.metrics.weightKg - next.metrics.weightKg
            : null;

          const deltaText =
            deltaKg == null
              ? null
              : weightUnitPref === 'lbs'
              ? `${(deltaKg * 2.2046226218).toFixed(1)} lb`
              : `${deltaKg.toFixed(1)} kg`;

          const deltaSign = deltaKg == null ? '' : deltaKg > 0 ? '+' : '';

          return (
            <Box
              key={ci._id}
              sx={{
                px: 1.5,
                py: 1.15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                borderTop:
                  idx === 0 ? 'none' : '1px solid rgba(255,255,255,0.08)',
                position: 'relative',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' }
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  background:
                    'linear-gradient(180deg, rgba(59,130,246,0.9), rgba(124,58,237,0.9))',
                  opacity: 0.75
                }}
              />

              <Box sx={{ minWidth: 0, flex: 1, pl: 0.5 }}>
                <Stack direction='row' alignItems='center' spacing={1}>
                  <Typography variant='body2' sx={{ fontWeight: 650 }}>
                    {dateText}
                  </Typography>

                  {deltaText ? (
                    <Typography
                      variant='caption'
                      sx={{
                        color:
                          deltaKg != null && deltaKg <= 0
                            ? 'rgba(34,197,94,0.9)'
                            : 'rgba(239,68,68,0.9)',
                        fontWeight: 700
                      }}
                    >
                      {deltaSign}
                      {deltaText}
                    </Typography>
                  ) : null}

                  {hasPhotos ? (
                    <IconButton
                      size='small'
                      aria-label='view progress photos'
                      onClick={() => setSelectedCheckIn(ci)}
                      sx={{
                        ml: 0.5,
                        border: '1px solid rgba(42,201,184,0.35)',
                        backgroundColor: 'rgba(42,201,184,0.10)',
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'rgba(42,201,184,0.18)'
                        }
                      }}
                    >
                      <PhotoLibraryOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  ) : null}
                </Stack>

                {hasNotes ? (
                  <Typography
                    variant='caption'
                    sx={{
                      display: 'block',
                      mt: 0.25,
                      color: 'rgba(255,255,255,0.70)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: { xs: 220, sm: 420, md: 520 }
                    }}
                    title={notes}
                  >
                    {notes}
                  </Typography>
                ) : (
                  <Typography
                    variant='caption'
                    sx={{
                      display: 'block',
                      mt: 0.25,
                      color: 'rgba(255,255,255,0.35)'
                    }}
                  >
                    No notes
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  px: 1.1,
                  py: 0.5,
                  borderRadius: 999,
                  backgroundColor: 'rgba(99,102,241,0.16)',
                  border: '1px solid rgba(99,102,241,0.35)',
                  boxShadow: '0 10px 20px rgba(99,102,241,0.08)',
                  flex: '0 0 auto'
                }}
              >
                <Typography variant='body2' sx={{ fontWeight: 800 }}>
                  {formatWeight(ci.metrics.weightKg, weightUnitPref)}{' '}
                  <Box
                    component='span'
                    sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}
                  >
                    {weightUnitPref}
                  </Box>
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>

      <CheckInPhotosDialog
        open={Boolean(selectedCheckIn)}
        onClose={() => setSelectedCheckIn(null)}
        checkIn={selectedCheckIn}
      />
    </>
  );
};

export default CheckInList;
