import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const CalculatorContainer = styled(Box)(() => ({
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
}));

export const DisplaySection = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f5f5f5',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  minHeight: '100px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
}));

export const ButtonSection = styled(Box)(({ theme }) => ({
  '& .MuiButton-root': {
    fontWeight: 'bold',
    '&:hover': {
      transform: 'scale(1.02)',
    },
    transition: 'all 0.1s ease-in-out',
  },
  '& .MuiButton-contained': {
    backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#e0e0e0',
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? '#525252' : '#d0d0d0',
    },
  },
  '& .MuiButton-outlined': {
    borderColor: theme.palette.divider,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

export const HistorySection = styled(Box)(({ theme }) => ({
  maxHeight: '400px',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f1f1f1',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#555' : '#c1c1c1',
    borderRadius: '3px',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? '#777' : '#a8a8a8',
    },
  },
}));
