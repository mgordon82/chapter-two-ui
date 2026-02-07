import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Stack,
  Button,
  Alert
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import {
  storyUpdated,
  storyCleared,
  storyAnalysisRequested
} from '../storySlice';
import { insightsCleared } from '../../insights/insightsSlice';

const StoryInput: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    text: storyText,
    isAnalyzing,
    error
  } = useAppSelector((state) => state.story);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    dispatch(storyUpdated(e.target.value));
  };

  const handleClear = () => {
    dispatch(storyCleared());
    dispatch(insightsCleared());
  };

  const handleSubmit = () => {
    dispatch(storyAnalysisRequested());
  };

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        Tell us what happened
      </Typography>
      <Typography variant='body2' color='text.secondary' gutterBottom>
        Describe your experience in your own words. There’s no right or wrong
        way to share it.
      </Typography>

      <TextField
        multiline
        minRows={6}
        fullWidth
        value={storyText}
        onChange={handleChange}
        placeholder='For example: My manager has been making comments about my medical condition and...'
        sx={{ mt: 2 }}
      />
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='space-between'
        sx={{ mt: 2 }}
      >
        <Box>{error !== '' && <Alert severity='error'>{error}</Alert>}</Box>
        <Stack
          direction='row'
          spacing={2}
          justifyContent='flex-end'
          sx={{ mt: 2 }}
        >
          <Button
            variant='outlined'
            onClick={handleClear}
            disabled={!storyText}
          >
            Clear
          </Button>
          <Button
            variant='contained'
            disabled={!storyText}
            onClick={handleSubmit}
            loading={isAnalyzing}
            loadingIndicator='Analyzing...'
            sx={{ px: 3 }}
          >
            Analyze
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default StoryInput;
