import React, { useEffect, useRef } from 'react';
import { Box, Stack } from '@mui/material';
import { useParams } from 'react-router-dom';
import ClientProfileHeader from '../../../features/clientProfile/components/ClientProfileHeader';
import ClientOverviewCard from '../../../features/clientProfile/components/ClientOverviewCard';
import NutritionTargetsCard from '../../../features/clientProfile/components/NutritionTargetsCard';
import CoachNotesCard from '../../../features/clientProfile/components/CoachNotesCard';
import WeightTrendCard from '../../../features/clientProfile/components/WeightTrendCard';
import LatestCheckInCard from '../../../features/clientProfile/components/LatestCheckInCard';
import ActivitySnapshotCard from '../../../features/clientProfile/components/ActivitySnapshotCard';
import ProgressInsightsCard from '../../../features/clientProfile/components/ProgressInsightsCard';
import ProgressPhotosCard from '../../../features/clientProfile/components/ProgressPhotosCard';
import QuickActionsCard from '../../../features/clientProfile/components/QuickActionsCard';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { clientProfileRequested } from '../../../features/clientProfile/redux/clientProfileSlice';
import {
  selectClientProfile,
  selectClientProfileLoading
} from '../../../features/clientProfile/redux/clientProfileSelectors';

const ClientProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { userId } = useParams();

  const profile = useAppSelector(selectClientProfile);
  const isLoading = useAppSelector(selectClientProfileLoading);

  const checkInSectionRef = useRef<HTMLDivElement | null>(null);
  const photoSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (userId) {
      dispatch(clientProfileRequested({ userId }));
    }
  }, [userId, dispatch]);

  if (isLoading || !profile) {
    return <Box sx={{ p: 4 }}>Loading client profile...</Box>;
  }

  const weightToGoalKg =
    profile.overview.currentWeightKg != null &&
    profile.overview.goalWeightKg != null
      ? profile.overview.currentWeightKg - profile.overview.goalWeightKg
      : null;

  const handleMessage = () => {
    if (!profile.overview.email) return;
    window.location.href = `mailto:${profile.overview.email}`;
  };

  const scrollToCheckIns = () => {
    checkInSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const scrollToPhotos = () => {
    photoSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 1, md: 2 }, py: 3 }}>
      <Stack spacing={3}>
        <ClientProfileHeader
          displayName={profile.overview.fullName}
          email={profile.overview.email ?? null}
          roles={[profile.overview.role]}
          status={profile.overview.status}
          assignedCoach={profile.overview.assignedCoach?.fullName ?? null}
          createdAt={profile.overview.joinedAt}
          lastCheckInAt={profile.latestCheckIn?.recordedAt ?? null}
          weightToGoalKg={weightToGoalKg}
          onMessage={profile.overview.email ? handleMessage : undefined}
        />

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          alignItems='flex-start'
        >
          <Stack
            spacing={3}
            sx={{ width: { xs: '100%', md: 360 }, flexShrink: 0 }}
          >
            <ClientOverviewCard overview={profile.overview} />
            <NutritionTargetsCard nutrition={profile.nutrition} />
            <CoachNotesCard notes={profile.notes} />
          </Stack>

          <Stack spacing={3} sx={{ flex: 1, width: '100%' }}>
            <Box ref={checkInSectionRef}>
              <WeightTrendCard
                weightTrend={profile.weightTrend}
                goalWeightKg={profile.overview.goalWeightKg ?? null}
              />
            </Box>

            <LatestCheckInCard latestCheckIn={profile.latestCheckIn} />
            <ActivitySnapshotCard activity={profile.activity} />
            <ProgressInsightsCard insights={profile.insights} />

            <Box ref={photoSectionRef}>
              <ProgressPhotosCard photos={profile.photos} />
            </Box>

            <QuickActionsCard
              onViewCheckInHistory={scrollToCheckIns}
              onOpenPhotoHistory={scrollToPhotos}
            />
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ClientProfilePage;
