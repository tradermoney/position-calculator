import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Timeline as PyramidIcon,
  Calculate as CalculateIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  AccountBalance as AccountBalanceIcon,
  PriceChange as PriceChangeIcon,
  TrendingUp as VolatilityIcon,
  ShowChart as KellyIcon,
  Functions as CalculatorIcon,
  TrendingUp as BreakEvenIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  GitHub as GitHubIcon,
} from '@mui/icons-material';
import { useAppContext } from '../../contexts/appContextHooks';

interface AppLayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 240;

const menuItems = [
  { id: 'dashboard', label: '功能索引', icon: <DashboardIcon />, path: '/dashboard' },
  { id: 'add-position', label: '补仓计算', icon: <AddIcon />, path: '/add-position' },
  { id: 'pyramid', label: '金字塔委托单计算器', icon: <PyramidIcon />, path: '/pyramid' },
  { id: 'pnl-calculator', label: '盈亏计算器', icon: <CalculateIcon />, path: '/pnl-calculator' },
  { id: 'target-price-calculator', label: '目标价格计算器', icon: <TrendingUpIcon />, path: '/target-price-calculator' },
  { id: 'liquidation-calculator', label: '强平价格计算器', icon: <WarningIcon />, path: '/liquidation-calculator' },
  { id: 'max-position-calculator', label: '可开计算器', icon: <AccountBalanceIcon />, path: '/max-position-calculator' },
  { id: 'entry-price-calculator', label: '开仓价格计算器', icon: <PriceChangeIcon />, path: '/entry-price-calculator' },
  { id: 'volatility-calculator', label: '波动率计算器', icon: <VolatilityIcon />, path: '/volatility-calculator' },
  { id: 'kelly-calculator', label: '凯利公式计算器', icon: <KellyIcon />, path: '/kelly-calculator' },
  { id: 'break-even-calculator', label: '保本回报率计算器', icon: <BreakEvenIcon />, path: '/break-even-calculator' },
  { id: 'fee-comparison', label: 'Maker/Taker费率对比', icon: <CalculateIcon />, path: '/fee-comparison' },
  { id: 'calculator', label: '计算器', icon: <CalculatorIcon />, path: '/calculator' },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state, setTheme } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleThemeToggle = () => {
    setTheme(state.theme === 'light' ? 'dark' : 'light');
  };

  const handleGitHubClick = () => {
    window.open('https://github.com/tradermoney/position-calculator', '_blank', 'noopener,noreferrer');
  };

  const handlePageChange = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          合约计算器
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={isSelected}
                onClick={() => handlePageChange(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main + '20',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main + '30',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isSelected ? theme.palette.primary.main : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: isSelected ? theme.palette.primary.main : 'inherit',
                      fontWeight: isSelected ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100vw - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="打开导航菜单"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.label || '合约计算器'}
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleGitHubClick}
            aria-label="查看GitHub仓库"
            sx={{ mr: 1 }}
          >
            <GitHubIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleThemeToggle}
            aria-label="切换主题"
          >
            {state.theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="导航菜单"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100vw - ${drawerWidth}px)` },
          backgroundColor: theme.palette.background.default,
          overflowX: 'hidden',
        }}
      >
        <Toolbar />
        <Box
          sx={{
            py: { xs: 0.5, sm: 1 },
            px: 0,
            width: '100%',
            maxWidth: '100%',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
