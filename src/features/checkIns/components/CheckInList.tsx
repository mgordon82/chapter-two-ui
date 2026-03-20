import { useState } from 'react';
import { Box, Stack, Typography, IconButton } from '@mui/material';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';

import { formatWeight } from '../helpers';
import type { UnitPrefType } from '../types';
import type { MappedCheckIn } from '../redux/checkInsSlice';
import CheckInPhotosDialog from './CheckInPhotosDialog';

type CheckInListTypes = {
  filteredItems: MappedCheckIn[];
  weightUnitPref: UnitPrefType;
  onOpenCheckIn: (date: string) => void;
};

function getCheckInNotes(ci: MappedCheckIn): string {
  return typeof ci.notes === 'string' ? ci.notes.trim() : '';
}

function getCheckInSourceLabel(ci: MappedCheckIn): string | null {
  if (!ci.raw || typeof ci.raw !== 'object') return null;

  const raw = ci.raw as {
    source?: {
      appSourceName?: string | null;
      type?: string | null;
    };
  };

  if (raw.source?.appSourceName) return raw.source.appSourceName;
  if (raw.source?.type === 'apple_health') return 'Apple Health';

  return null;
}

function formatRepresentedDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;

  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

const CheckInList = ({
  filteredItems,
  weightUnitPref,
  onOpenCheckIn
}: CheckInListTypes) => {
  const [selectedCheckIn, setSelectedCheckIn] = useState<MappedCheckIn | null>(
    null
  );

  if (filteredItems.length === 0) {
    return (
      <Typography variant='body2' color='text.secondary'>
        No check-ins in this range.
      </Typography>
    );
  }

  const items = filteredItems.filter(
    (ci): ci is MappedCheckIn & { representedDate: string; weightKg: number } =>
      ci.representedDate != null && ci.weightKg != null
  );

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
          const hasPhotos = Boolean(ci.hasPhotos && ci.photos?.length);
          const sourceLabel = getCheckInSourceLabel(ci);

          const dateText = formatRepresentedDate(ci.representedDate);

          const next = idx < items.length - 1 ? items[idx + 1] : null;
          const deltaKg = next ? ci.weightKg - next.weightKg : null;

          const deltaText =
            deltaKg == null
              ? null
              : weightUnitPref === 'lbs'
              ? `${(deltaKg * 2.2046226218).toFixed(1)} lb`
              : `${deltaKg.toFixed(1)} kg`;

          const deltaSign = deltaKg == null ? '' : deltaKg > 0 ? '+' : '';

          const handleOpen = () => {
            if (!ci.representedDate) return;

            console.log('[CheckInList] clicked', {
              id: ci.id,
              representedDate: ci.representedDate,
              recordedAt: ci.recordedAt,
              weightKg: ci.weightKg,
              weightSource: ci.weightSource,
              hasWeightConflict: ci.hasWeightConflict
            });

            onOpenCheckIn(ci.representedDate);
          };

          return (
            <Box
              key={ci.id}
              onClick={handleOpen}
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
                cursor: 'pointer',
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
                <Stack
                  direction='row'
                  alignItems='center'
                  spacing={1}
                  flexWrap='wrap'
                >
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

                  {sourceLabel || ci.weightSource || ci.hasWeightConflict ? (
                    <Stack direction='row' spacing={0.75} alignItems='center'>
                      {sourceLabel ? (
                        <Typography
                          variant='caption'
                          sx={{
                            px: 0.75,
                            py: 0.15,
                            borderRadius: 999,
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.7)',
                            fontWeight: 700
                          }}
                        >
                          {sourceLabel}
                        </Typography>
                      ) : null}

                      {ci.weightSource ? (
                        <Typography
                          variant='caption'
                          sx={{
                            px: 0.75,
                            py: 0.15,
                            borderRadius: 999,
                            backgroundColor: 'rgba(99,102,241,0.16)',
                            color: 'rgba(255,255,255,0.78)',
                            fontWeight: 700
                          }}
                        >
                          {ci.weightSource === 'manual'
                            ? 'Manual'
                            : ci.weightSource === 'apple_health'
                            ? 'Apple Weight'
                            : 'Legacy'}
                        </Typography>
                      ) : null}

                      {ci.hasWeightConflict ? (
                        <Typography
                          variant='caption'
                          sx={{
                            px: 0.75,
                            py: 0.15,
                            borderRadius: 999,
                            backgroundColor: 'rgba(245,158,11,0.16)',
                            color: 'rgba(255,255,255,0.82)',
                            fontWeight: 700
                          }}
                        >
                          Conflict
                        </Typography>
                      ) : null}
                    </Stack>
                  ) : null}

                  {hasPhotos ? (
                    <IconButton
                      size='small'
                      aria-label='view progress photos'
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCheckIn(ci);
                      }}
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
                  {formatWeight(ci.weightKg, weightUnitPref)}{' '}
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
