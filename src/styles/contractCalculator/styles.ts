import { Theme } from '@mui/material/styles';
import { contractCalculatorBorderRadius } from './borderRadius';
import { contractCalculatorColors } from './colors';
import { contractCalculatorShadows } from './shadows';

/**
 * 获取合约计算器页面的样式对象
 */
export const getContractCalculatorStyles = (theme: Theme) => ({
  pageContainer: {
    padding: theme.spacing(3),
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default,
  },
  pageTitle: {
    marginBottom: theme.spacing(3),
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  calculatorCard: {
    borderRadius: contractCalculatorBorderRadius.medium,
    boxShadow: contractCalculatorShadows.light,
    transition: 'box-shadow 0.3s ease',
    '&:hover': {
      boxShadow: contractCalculatorShadows.medium,
    },
  },
  tabsContainer: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    '& .MuiTab-root': {
      minHeight: 72,
      textTransform: 'none',
      fontSize: '0.95rem',
      fontWeight: 500,
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
      '&.Mui-selected': {
        fontWeight: 600,
        color: theme.palette.primary.main,
      },
    },
    '& .MuiTabs-indicator': {
      height: 3,
      borderRadius: '3px 3px 0 0',
    },
  },
  inputSection: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: contractCalculatorBorderRadius.medium,
    marginBottom: theme.spacing(2),
  },
  resultSection: {
    padding: theme.spacing(3),
    backgroundColor: contractCalculatorColors.resultBg,
    borderRadius: contractCalculatorBorderRadius.medium,
    textAlign: 'center' as const,
  },
  positionButton: {
    flex: 1,
    height: 48,
    borderRadius: contractCalculatorBorderRadius.small,
    textTransform: 'none' as const,
    fontWeight: 600,
    transition: 'all 0.3s ease',
    '&.long': {
      '&.selected': {
        backgroundColor: contractCalculatorColors.long,
        color: 'white',
        '&:hover': {
          backgroundColor: contractCalculatorColors.long,
          opacity: 0.9,
        },
      },
      '&:not(.selected)': {
        borderColor: contractCalculatorColors.long,
        color: contractCalculatorColors.long,
        '&:hover': {
          backgroundColor: `${contractCalculatorColors.long}10`,
        },
      },
    },
    '&.short': {
      '&.selected': {
        backgroundColor: contractCalculatorColors.short,
        color: 'white',
        '&:hover': {
          backgroundColor: contractCalculatorColors.short,
          opacity: 0.9,
        },
      },
      '&:not(.selected)': {
        borderColor: contractCalculatorColors.short,
        color: contractCalculatorColors.short,
        '&:hover': {
          backgroundColor: `${contractCalculatorColors.short}10`,
        },
      },
    },
  },
  leverageSlider: {
    '& .MuiSlider-thumb': {
      width: 20,
      height: 20,
      '&:hover': {
        boxShadow: '0px 0px 0px 8px rgba(33, 150, 243, 0.16)',
      },
    },
    '& .MuiSlider-track': {
      height: 6,
      borderRadius: 3,
    },
    '& .MuiSlider-rail': {
      height: 6,
      borderRadius: 3,
      opacity: 0.3,
    },
    '& .MuiSlider-mark': {
      width: 2,
      height: 12,
      borderRadius: 1,
    },
  },
  inputField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: contractCalculatorBorderRadius.small,
      transition: 'all 0.3s ease',
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderWidth: 2,
      },
    },
    '& .MuiInputLabel-root': {
      fontWeight: 500,
    },
  },
  calculateButton: {
    height: 48,
    borderRadius: contractCalculatorBorderRadius.small,
    textTransform: 'none' as const,
    fontWeight: 600,
    fontSize: '1rem',
    boxShadow: contractCalculatorShadows.light,
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: contractCalculatorShadows.medium,
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },
  resultValue: {
    fontWeight: 700,
    fontSize: '2rem',
    lineHeight: 1.2,
    marginBottom: theme.spacing(1),
    '&.profit': {
      color: contractCalculatorColors.profit,
    },
    '&.loss': {
      color: contractCalculatorColors.loss,
    },
    '&.neutral': {
      color: contractCalculatorColors.neutral,
    },
  },
  resultLabel: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
  },
  warningAlert: {
    borderRadius: contractCalculatorBorderRadius.small,
    backgroundColor: contractCalculatorColors.warningBg,
    border: `1px solid ${theme.palette.warning.main}`,
    '& .MuiAlert-icon': {
      color: theme.palette.warning.main,
    },
  },
  errorAlert: {
    borderRadius: contractCalculatorBorderRadius.small,
    backgroundColor: contractCalculatorColors.errorBg,
    border: `1px solid ${theme.palette.error.main}`,
  },
  infoAlert: {
    borderRadius: contractCalculatorBorderRadius.small,
    backgroundColor: theme.palette.info.light + '20',
    border: `1px solid ${theme.palette.info.main}`,
  },
  quickSetButton: {
    minWidth: 'auto',
    padding: theme.spacing(0.5, 1),
    borderRadius: contractCalculatorBorderRadius.small,
    textTransform: 'none' as const,
    fontSize: '0.75rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  dataTable: {
    '& .MuiTableHead-root': {
      backgroundColor: theme.palette.grey[50],
    },
    '& .MuiTableCell-head': {
      fontWeight: 600,
      fontSize: '0.875rem',
      color: theme.palette.text.primary,
    },
    '& .MuiTableCell-body': {
      fontSize: '0.875rem',
    },
    '& .MuiTableRow-root': {
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  },
  responsiveSpacing: {
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(3),
    },
  },
  fadeIn: {
    animation: 'fadeIn 0.3s ease-in-out',
    '@keyframes fadeIn': {
      from: {
        opacity: 0,
        transform: 'translateY(10px)',
      },
      to: {
        opacity: 1,
        transform: 'translateY(0)',
      },
    },
  },
  loadingState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    color: theme.palette.text.secondary,
  },
});
