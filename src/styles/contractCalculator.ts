import { Theme } from '@mui/material/styles';

/**
 * 合约计算器组件的样式定义
 * 遵循UI设计四大原则：亲密性、对齐、重复、对比
 */

// 主题色彩配置
export const contractCalculatorColors = {
  // 盈亏相关颜色
  profit: '#4caf50',      // 盈利绿色
  loss: '#f44336',        // 亏损红色
  neutral: '#9e9e9e',     // 中性灰色
  
  // 仓位方向颜色
  long: '#4caf50',        // 做多绿色
  short: '#f44336',       // 做空红色
  
  // 背景色
  cardBg: '#fafafa',      // 卡片背景
  resultBg: '#f5f5f5',    // 结果背景
  warningBg: '#fff3e0',   // 警告背景
  errorBg: '#ffebee',     // 错误背景
  
  // 边框色
  border: '#e0e0e0',      // 默认边框
  activeBorder: '#2196f3', // 激活边框
};

// 间距配置
export const contractCalculatorSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// 圆角配置
export const contractCalculatorBorderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 16,
};

// 阴影配置
export const contractCalculatorShadows = {
  light: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  medium: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  heavy: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
};

// 通用样式函数
export const getContractCalculatorStyles = (theme: Theme) => ({
  // 页面容器
  pageContainer: {
    padding: theme.spacing(3),
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default,
  },

  // 标题样式
  pageTitle: {
    marginBottom: theme.spacing(3),
    fontWeight: 600,
    color: theme.palette.text.primary,
  },

  // 卡片样式
  calculatorCard: {
    borderRadius: contractCalculatorBorderRadius.medium,
    boxShadow: contractCalculatorShadows.light,
    transition: 'box-shadow 0.3s ease',
    '&:hover': {
      boxShadow: contractCalculatorShadows.medium,
    },
  },

  // 标签页样式
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

  // 输入区域样式
  inputSection: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    borderRadius: contractCalculatorBorderRadius.medium,
    marginBottom: theme.spacing(2),
  },

  // 结果区域样式
  resultSection: {
    padding: theme.spacing(3),
    backgroundColor: contractCalculatorColors.resultBg,
    borderRadius: contractCalculatorBorderRadius.medium,
    textAlign: 'center' as const,
  },

  // 仓位方向按钮样式
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

  // 杠杆滑块样式
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
    '& .MuiSlider-markLabel': {
      fontSize: '0.75rem',
      fontWeight: 500,
    },
  },

  // 输入框样式
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

  // 计算按钮样式
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

  // 结果数值样式
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

  // 结果标签样式
  resultLabel: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
  },

  // 警告提示样式
  warningAlert: {
    borderRadius: contractCalculatorBorderRadius.small,
    backgroundColor: contractCalculatorColors.warningBg,
    border: `1px solid ${theme.palette.warning.main}`,
    '& .MuiAlert-icon': {
      color: theme.palette.warning.main,
    },
  },

  // 错误提示样式
  errorAlert: {
    borderRadius: contractCalculatorBorderRadius.small,
    backgroundColor: contractCalculatorColors.errorBg,
    border: `1px solid ${theme.palette.error.main}`,
  },

  // 信息提示样式
  infoAlert: {
    borderRadius: contractCalculatorBorderRadius.small,
    backgroundColor: theme.palette.info.light + '20',
    border: `1px solid ${theme.palette.info.main}`,
  },

  // 快速设置按钮样式
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

  // 表格样式
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

  // 响应式间距
  responsiveSpacing: {
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(3),
    },
  },

  // 动画效果
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

  // 加载状态
  loadingState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    color: theme.palette.text.secondary,
  },
});

// 导出样式工具函数
export const getPositionButtonClass = (side: 'long' | 'short', selected: boolean) => {
  return `${side} ${selected ? 'selected' : ''}`;
};

export const getResultValueClass = (value: number) => {
  if (value > 0) return 'profit';
  if (value < 0) return 'loss';
  return 'neutral';
};
