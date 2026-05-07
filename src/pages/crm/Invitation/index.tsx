import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import InviteStepperShell from '../../../features/invite/components/InviteStepperShell';
import BasicInfoStep from '../../../features/invite/components/steps/BasicInfoStep';
import AddressStep from '../../../features/invite/components/steps/AddressStep';
import { initialInvitationFormValues } from '../../../features/invite/constants';
import type { InvitationFormValues } from '../../../features/invite/types';
import BodyInfoStep from '../../../features/invite/components/steps/BodyInfoStep';
import TrainingSetupStep from '../../../features/invite/components/steps/TrainingSetupStep';
import InjuriesStep from '../../../features/invite/components/steps/InjuriesStep';
import NutritionStep from '../../../features/invite/components/steps/NutritionStep';
import TrainingAvailabilityStep from '../../../features/invite/components/steps/TrainingAvailabilityStep';
import MotivationStep from '../../../features/invite/components/steps/MotivationStep';
import { feetInchesToCm } from '../../../utils/conversions/measurement';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  loadInvitationRequested,
  submitInviteOnboardingRequested
} from '../../../features/invite/redux/inviteOnboardingSlice';

const InvitationForm = () => {
  const dispatch = useAppDispatch();
  const { userId, token } = useParams();
  const { submitStatus, submitError, loadStatus, loadError, invitation } =
    useAppSelector((state) => state.inviteOnboarding);
  const [activeStep, setActiveStep] = useState(0);
  const [values, setValues] = useState<InvitationFormValues>(
    initialInvitationFormValues
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (submitStatus === 'succeeded') {
      navigate('/', { replace: true });
    }
  }, [navigate, submitStatus]);

  useEffect(() => {
    if (userId && token) {
      dispatch(loadInvitationRequested({ userId, token }));
    }
  }, [dispatch, userId, token]);

  const setField = <K extends keyof InvitationFormValues>(
    field: K,
    value: InvitationFormValues[K]
  ) => {
    setValues((prev) => {
      const next = {
        ...prev,
        [field]: value
      };

      if (field === 'trainingLocation') {
        const trainingLocation =
          value as InvitationFormValues['trainingLocation'];

        if (trainingLocation === 'home') {
          next.gymEquipment = [];
        }

        if (trainingLocation === 'gym') {
          next.homeEquipment = [];
        }

        if (trainingLocation === '') {
          next.homeEquipment = [];
          next.gymEquipment = [];
        }
      }

      if (field === 'hasInjuries' && value === 'no') {
        next.injuryDetails = '';
      }

      if (field === 'followedNutritionApproach' && value === 'no') {
        next.nutritionApproachDetails = '';
      }

      if (field === 'trainingDaysPerWeek' && !value) {
        next.trainingDays = [];
      }

      if (field === 'heightUnit') {
        const heightUnit = value as InvitationFormValues['heightUnit'];

        if (heightUnit === 'cm') {
          next.heightFeet = '';
          next.heightInches = '';
        }

        if (heightUnit === 'ft_in') {
          next.heightCmValue = '';
        }
      }

      return next;
    });
  };

  const isCurrentStepValid = useMemo(() => {
    switch (activeStep) {
      case 0:
        return Boolean(
          values.firstName.trim() &&
            values.lastName.trim() &&
            values.dateOfBirth
        );

      case 1:
        return Boolean(
          values.addressLine1.trim() &&
            values.city.trim() &&
            values.state.trim() &&
            values.zip.trim() &&
            values.country.trim()
        );

      case 2: {
        const weight = Number(values.weightValue);

        const hasValidWeight =
          values.weightValue.trim() !== '' &&
          Number.isFinite(weight) &&
          weight > 0;

        const hasValidHeight =
          values.heightUnit === 'cm'
            ? (() => {
                const cm = Number(values.heightCmValue);
                return (
                  values.heightCmValue.trim() !== '' &&
                  Number.isFinite(cm) &&
                  cm > 0
                );
              })()
            : (() => {
                const feet = Number(values.heightFeet);
                const inches = Number(values.heightInches);
                return (
                  values.heightFeet.trim() !== '' &&
                  values.heightInches.trim() !== '' &&
                  Number.isFinite(feet) &&
                  Number.isFinite(inches) &&
                  feet >= 0 &&
                  inches >= 0
                );
              })();

        return Boolean(hasValidWeight && hasValidHeight && values.job.trim());
      }

      case 3:
        if (!values.trainingLocation) return false;
        if (
          (values.trainingLocation === 'home' ||
            values.trainingLocation === 'both') &&
          values.homeEquipment.length === 0
        ) {
          return false;
        }
        if (
          (values.trainingLocation === 'gym' ||
            values.trainingLocation === 'both') &&
          values.gymEquipment.length === 0
        ) {
          return false;
        }
        return true;

      case 4:
        if (!values.hasInjuries) return false;
        if (values.hasInjuries === 'yes' && !values.injuryDetails.trim()) {
          return false;
        }
        return true;

      case 5:
        if (!values.followedNutritionApproach) return false;
        if (
          values.followedNutritionApproach === 'yes' &&
          !values.nutritionApproachDetails.trim()
        ) {
          return false;
        }
        return Boolean(
          values.perfectNutrition.trim() &&
            values.favoriteFoods.trim() &&
            values.leastFavoriteFoods.trim()
        );

      case 6:
        if (!values.trainingTimePerSession || !values.trainingDaysPerWeek) {
          return false;
        }
        if (
          Number(values.trainingDaysPerWeek) > 0 &&
          values.trainingDays.length === 0
        ) {
          return false;
        }
        return true;

      case 7:
        return Boolean(
          values.motivationReason.trim() &&
            values.motivationStyle &&
            values.interestedInExtraIncome
        );

      default:
        return false;
    }
  }, [activeStep, values]);

  const steps = useMemo(
    () => [
      {
        label: 'Basic Info',
        content: <BasicInfoStep values={values} setField={setField} />
      },
      {
        label: 'Address',
        content: <AddressStep values={values} setField={setField} />
      },
      {
        label: 'Body Info',
        content: <BodyInfoStep values={values} setField={setField} />
      },
      {
        label: 'Training Setup',
        content: <TrainingSetupStep values={values} setField={setField} />
      },
      {
        label: 'Injuries',
        content: <InjuriesStep values={values} setField={setField} />
      },
      {
        label: 'Nutrition',
        content: <NutritionStep values={values} setField={setField} />
      },
      {
        label: 'Training Availability',
        content: (
          <TrainingAvailabilityStep values={values} setField={setField} />
        )
      },
      {
        label: 'Motivation',
        content: <MotivationStep values={values} setField={setField} />
      }
    ],
    [values]
  );

  const totalSteps = steps.length;
  const currentStep = steps[activeStep];

  const handleNext = () => {
    if (activeStep < totalSteps - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!userId || !token) return;

    const weight = Number(values.weightValue);

    const weightKg = values.weightUnit === 'lbs' ? weight * 0.453592 : weight;

    let heightCm: number | null = null;

    if (values.heightUnit === 'cm') {
      heightCm = Number(values.heightCmValue);
    } else {
      const feet = Number(values.heightFeet);
      const inches = Number(values.heightInches);
      heightCm = feetInchesToCm(feet, inches);
    }

    dispatch(
      submitInviteOnboardingRequested({
        userId,
        token,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        dateOfBirth: values.dateOfBirth,
        pronouns: values.pronouns || null,

        address: {
          line1: values.addressLine1.trim(),
          line2: values.addressLine2.trim(),
          city: values.city.trim(),
          state: values.state.trim(),
          zip: values.zip.trim(),
          country: values.country.trim()
        },

        weightKg: Number.isFinite(weightKg)
          ? Number(weightKg.toFixed(2))
          : null,

        heightCm: Number.isFinite(heightCm)
          ? Number(heightCm.toFixed(2))
          : null,

        job: values.job.trim(),

        training: {
          location: values.trainingLocation,
          homeEquipment: values.homeEquipment,
          gymEquipment: values.gymEquipment,
          daysPerWeek: Number(values.trainingDaysPerWeek) || 0,
          days: values.trainingDays,
          sessionTime: values.trainingTimePerSession
        },

        injuries: {
          has: values.hasInjuries === 'yes',
          details: values.injuryDetails.trim()
        },

        nutrition: {
          followedApproach: values.followedNutritionApproach === 'yes',
          approachDetails: values.nutritionApproachDetails.trim(),
          perfectNutrition: values.perfectNutrition.trim(),
          favoriteFoods: values.favoriteFoods.trim(),
          leastFavoriteFoods: values.leastFavoriteFoods.trim()
        },

        motivation: {
          reason: values.motivationReason.trim(),
          style: values.motivationStyle,
          interestedInExtraIncome: values.interestedInExtraIncome === 'yes'
        }
      })
    );
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  if (loadStatus === 'loading') {
    return (
      <Box
        sx={{
          minHeight: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 4
        }}
      >
        <Paper
          elevation={2}
          sx={{
            width: '100%',
            maxWidth: 720,
            p: 4,
            borderRadius: 3,
            textAlign: 'center'
          }}
        >
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Loading invitation...</Typography>
        </Paper>
      </Box>
    );
  }

  if (loadStatus === 'failed') {
    const isExpired = loadError === 'Invitation has expired';

    return (
      <Box
        sx={{
          minHeight: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 4
        }}
      >
        <Paper
          elevation={2}
          sx={{
            width: '100%',
            maxWidth: 720,
            p: 4,
            borderRadius: 3
          }}
        >
          <Alert sx={{ mb: 2 }} severity='error'>
            {loadError || 'This invitation could not be loaded.'}
          </Alert>

          {isExpired ? (
            <Typography variant='body2' color='text.secondary'>
              Please contact your coach and ask them to send you a new invite.
            </Typography>
          ) : null}
        </Paper>
      </Box>
    );
  }

  if (invitation?.onboardingStatus === 'completed') {
    return (
      <Box
        sx={{
          minHeight: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 4
        }}
      >
        <Paper
          elevation={2}
          sx={{
            width: '100%',
            maxWidth: 720,
            p: 4,
            borderRadius: 3
          }}
        >
          <Alert sx={{ mb: 2 }} severity='info'>
            This onboarding form has already been completed.
          </Alert>

          <Button variant='contained' onClick={() => navigate('/')}>
            Go to Home Screen
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4
      }}
    >
      <Paper
        elevation={2}
        sx={{
          width: '100%',
          maxWidth: 720,
          p: 4,
          borderRadius: 3
        }}
      >
        {submitError && (
          <Alert sx={{ mb: 2 }} severity='error'>
            {submitError}
          </Alert>
        )}
        <InviteStepperShell
          activeStep={activeStep}
          totalSteps={totalSteps}
          stepLabel={currentStep.label}
          onBack={handleBack}
          onNext={handleNext}
          nextDisabled={!isCurrentStepValid || submitStatus === 'loading'}
        >
          {currentStep.content}
        </InviteStepperShell>
      </Paper>
    </Box>
  );
};

export default InvitationForm;
