import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import {
  trendAnalyzeRequested,
  type TrendRange,
  type TrendState
} from './redux/trendSlice';
import type { WeightUnitPref } from '../../types/units';
import TrendCollapseSection from './components/TrendCollapse';

type TrendAnalysisCardProps = {
  trend: TrendState;
  displayUnitLabel: 'kg' | 'lb';
  unitPref: WeightUnitPref;
};

const TrendAnalysisCard = ({
  trend,
  displayUnitLabel,
  unitPref
}: TrendAnalysisCardProps) => {
  const dispatch = useAppDispatch();

  const [showAnalyze, setShowAnalyze] = useState(false);
  const [showTrendDetails, setShowTrendDetails] = useState(false);
  const [showFullQuickRead, setShowFullQuickRead] = useState(false);
  const [showFullRationale, setShowFullRationale] = useState(false);

  const ANALYZE_RANGE = '3M' as TrendRange;

  const openAnalyzePanel = () => {
    setShowAnalyze(true);
    setShowTrendDetails(false);
    setShowFullQuickRead(false);
    setShowFullRationale(false);

    if (!trend.data && trend.status !== 'loading') {
      dispatch(trendAnalyzeRequested({ range: ANALYZE_RANGE }));
    }
  };

  const closeAnalyzePanel = () => {
    setShowAnalyze(false);
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        background:
          'linear-gradient(135deg, rgba(255,193,7,0.10), rgba(255,193,7,0.02))'
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent='space-between'
            spacing={1.5}
          >
            <Stack
              direction='row'
              spacing={1.25}
              alignItems='center'
              sx={{ minWidth: 0 }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  border: '1px solid',
                  borderColor: 'divider',
                  flexShrink: 0
                }}
              >
                <AutoAwesomeIcon fontSize='small' />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant='subtitle1'
                  sx={{ fontWeight: 700, lineHeight: 1.1 }}
                >
                  Trend Analysis
                </Typography>

                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: { xs: 2, sm: 'unset' },
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  Analyze your recent check-ins and get next-step
                  recommendations.
                </Typography>
              </Box>
            </Stack>

            <Button
              variant={showAnalyze ? 'outlined' : 'contained'}
              onClick={() => {
                if (showAnalyze) closeAnalyzePanel();
                else openAnalyzePanel();
              }}
              fullWidth={false}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                alignSelf: { xs: 'stretch', sm: 'center' },
                width: { xs: '100%', sm: 'auto' },
                minWidth: { sm: 160 },
                whiteSpace: 'nowrap',
                py: { xs: 1.1, sm: 0.8 }
              }}
            >
              <Box
                component='span'
                sx={{ display: { xs: 'inline', sm: 'none' } }}
              >
                {showAnalyze ? 'Hide' : 'Analyze'}
              </Box>

              <Box
                component='span'
                sx={{ display: { xs: 'none', sm: 'inline' } }}
              >
                {showAnalyze ? 'Hide analysis' : 'Analyze trend'}
              </Box>
            </Button>
          </Stack>
          <TrendCollapseSection
            trend={trend}
            range={ANALYZE_RANGE}
            displayUnitLabel={displayUnitLabel}
            unitPref={unitPref}
            showAnalyze={showAnalyze}
            showTrendDetails={showTrendDetails}
            setShowTrendDetails={setShowTrendDetails}
            showFullQuickRead={showFullQuickRead}
            setShowFullQuickRead={setShowFullQuickRead}
            showFullRationale={showFullRationale}
            setShowFullRationale={setShowFullRationale}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TrendAnalysisCard;
