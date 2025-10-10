import { styled } from '@mui/material/styles';
import { Box, Card, Typography, TextField } from '@mui/material';

// 主容器样式
export const VolatilityContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1), // 移动端更小边距
  width: '100%',
  maxWidth: 'none', // 移除最大宽度限制
  margin: 0,
  
  // PC端更小边距以充分利用空间
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2),
  },
  
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2.5),
  },
}));

// 计算器卡片样式
export const CalculatorCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2), // 移动端较小边距
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  boxShadow: theme.shadows[2],
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  border: `1px solid ${theme.palette.divider}`,
  
  // PC端正常边距
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
}));

// 输入区域样式
export const InputSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(4),

  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
  },
}));

// 输入框组样式
export const InputGroup = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),

  [theme.breakpoints.up('md')]: {
    maxWidth: '280px',
    minWidth: '200px',
  },
}));

// 自定义输入框样式
export const PriceInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    fontSize: '1.1rem',
    fontWeight: 500,
    backgroundColor: theme.palette.background.paper,
    transition: 'all 0.3s ease',
    
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
    },
  },
  
  '& .MuiOutlinedInput-input': {
    padding: theme.spacing(1.5, 2),
    textAlign: 'center',
    fontSize: '1.1rem',
    fontWeight: 500,
  },
  
  '& .MuiInputLabel-root': {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: theme.palette.text.secondary,
    
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}));

// 结果显示区域样式
export const ResultSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(4, 2),
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.grey[900]
    : theme.palette.grey[50],
  borderRadius: 16,
  border: `2px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(3),
}));

// 波动率结果样式
export const VolatilityResult = styled(Typography)(({ theme, color }) => ({
  fontSize: '3rem',
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  background: color === 'positive' 
    ? 'linear-gradient(45deg, #4caf50, #66bb6a)'
    : color === 'negative'
    ? 'linear-gradient(45deg, #f44336, #ef5350)'
    : 'linear-gradient(45deg, #757575, #9e9e9e)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  
  [theme.breakpoints.down('md')]: {
    fontSize: '2.5rem',
  },
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  },
}));

// 结果标签样式
export const ResultLabel = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 500,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
}));

// 计算详情样式
export const CalculationDetails = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.action.hover,
  borderRadius: 8,
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
}));

// 历史记录卡片样式
export const HistoryCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: 12,
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2), // 移动端较小边距
  
  // PC端正常边距
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
}));

// 历史记录项样式
export const HistoryItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease',
  
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  
  '&:last-child': {
    borderBottom: 'none',
  },
}));

// 历史记录内容样式
export const HistoryContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
}));

// 历史记录数据样式
export const HistoryData = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  flexWrap: 'wrap',
  
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(0.5),
  },
}));

// 历史记录时间样式
export const HistoryTime = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
  fontWeight: 400,
}));

// 空状态样式
export const EmptyState = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(4),
  color: theme.palette.text.secondary,
}));

// 操作按钮区域样式
export const ActionSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  justifyContent: 'center',
  marginTop: theme.spacing(3),
  
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

// 说明文本样式
export const InfoText = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  color: theme.palette.text.secondary,
  textAlign: 'center',
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.action.hover,
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
}));

// 响应式网格样式
export const ResponsiveGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  gridTemplateColumns: '1fr',
  width: '100%',
  
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: '4fr 1fr', // 进一步增加主内容区域比例，让内容更宽
  },
}));

// 计算器主区域样式
export const CalculatorMain = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

// 历史记录侧边栏样式
export const HistorySidebar = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));
