import { styled } from '@mui/material/styles';
import { Card, Slider, Typography, Box } from '@mui/material';

export const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: theme.shadows[3],
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[6],
  },
}));

export const StyledSlider = styled(Slider)(({ theme }) => ({
  '& .MuiSlider-thumb': {
    width: 20,
    height: 20,
    backgroundColor: theme.palette.primary.main,
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: `0px 0px 0px 8px ${theme.palette.primary.main}20`,
    },
  },
  '& .MuiSlider-track': {
    backgroundColor: theme.palette.primary.main,
    border: 'none',
    height: 6,
  },
  '& .MuiSlider-rail': {
    backgroundColor: theme.palette.grey[300],
    height: 6,
  },
}));

export const ResultTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.5rem',
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1),
  textAlign: 'center',
}));

export const ResultValue = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '2rem',
  color: theme.palette.error.main,
  textAlign: 'center',
  marginBottom: theme.spacing(2),
}));

export const CostBreakdownBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 12,
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

export const CostItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
    fontWeight: 600,
    backgroundColor: theme.palette.action.hover,
    borderRadius: 8,
    padding: theme.spacing(1.5),
    margin: theme.spacing(1, 0, 0, 0),
  },
}));

export const InfoBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.info.light + '20',
  border: `1px solid ${theme.palette.info.main}`,
  borderRadius: 8,
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
}));