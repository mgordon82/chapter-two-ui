import { useMemo, useRef, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Capacitor } from '@capacitor/core';

type PullToRefreshProps = {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  disabled?: boolean;
  threshold?: number;
};

const PullToRefresh = ({
  onRefresh,
  children,
  disabled = false,
  threshold = 72
}: PullToRefreshProps) => {
  const isNative = Capacitor.isNativePlatform();

  const startYRef = useRef<number | null>(null);
  const pullingRef = useRef(false);
  const isRefreshingRef = useRef(false);

  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const canUsePullToRefresh = isNative && !disabled;

  const progress = useMemo(() => {
    if (!canUsePullToRefresh) return 0;
    return Math.max(0, Math.min(1, pullDistance / threshold));
  }, [canUsePullToRefresh, pullDistance, threshold]);

  const reset = () => {
    startYRef.current = null;
    pullingRef.current = false;
    setPullDistance(0);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!canUsePullToRefresh) return;
    if (refreshing || isRefreshingRef.current) return;
    if (window.scrollY > 0) return;

    startYRef.current = event.touches[0]?.clientY ?? null;
    pullingRef.current = true;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!canUsePullToRefresh) return;
    if (!pullingRef.current) return;
    if (refreshing || isRefreshingRef.current) return;
    if (window.scrollY > 0) return;

    const startY = startYRef.current;
    const currentY = event.touches[0]?.clientY ?? null;

    if (startY == null || currentY == null) return;

    const delta = currentY - startY;

    if (delta <= 0) {
      setPullDistance(0);
      return;
    }

    // soften the pull so it feels nicer
    const dampened = Math.min(110, delta * 0.5);
    setPullDistance(dampened);

    if (dampened > 0) {
      event.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (!canUsePullToRefresh) return;
    if (!pullingRef.current) return;
    if (refreshing || isRefreshingRef.current) {
      reset();
      return;
    }

    const shouldRefresh = pullDistance >= threshold;

    reset();

    if (!shouldRefresh) return;

    try {
      isRefreshingRef.current = true;
      setRefreshing(true);
      await onRefresh();
    } finally {
      isRefreshingRef.current = false;
      setRefreshing(false);
    }
  };

  return (
    <Box
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      sx={{ width: '100%' }}
    >
      {canUsePullToRefresh ? (
        <Box
          sx={{
            height: refreshing ? 52 : pullDistance,
            transition: refreshing ? 'height 180ms ease' : 'none',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {refreshing ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'text.secondary'
              }}
            >
              <CircularProgress size={16} />
              <Typography variant='caption'>Refreshing…</Typography>
            </Box>
          ) : pullDistance > 0 ? (
            <Typography
              variant='caption'
              sx={{
                color: 'text.secondary',
                opacity: progress
              }}
            >
              {pullDistance >= threshold
                ? 'Release to refresh'
                : 'Pull to refresh'}
            </Typography>
          ) : null}
        </Box>
      ) : null}

      {children}
    </Box>
  );
};

export default PullToRefresh;
