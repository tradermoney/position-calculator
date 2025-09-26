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
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountBalance as PositionIcon,
  Add as AddIcon,
  Timeline as PyramidIcon,
  Calculate as CalculateIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  AccountBalance as AccountBalanceIcon,
  PriceChange as PriceChangeIcon,
  TrendingUp as VolatilityIcon,
  Functions as CalculatorIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useAppContext } from '../../contexts/AppContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 240;

const menuItems = [
  { id: 'dashboard', label: '仪表盘', icon: <DashboardIcon />, path: '/dashboard' },
  { id: 'positions', label: '仓位管理', icon: <PositionIcon />, path: '/positions' },
  { id: 'add-position', label: '补仓计算', icon: <AddIcon />, path: '/add-position' },
  { id: 'pyramid', label: '金字塔加仓', icon: <PyramidIcon />, path: '/pyramid' },
  { id: 'pnl-calculator', label: '盈亏计算器', icon: <CalculateIcon />, path: '/pnl-calculator' },
  { id: 'target-price-calculator', label: '目标价格计算器', icon: <TrendingUpIcon />, path: '/target-price-calculator' },
  { id: 'liquidation-calculator', label: '强平价格计算器', icon: <WarningIcon />, path: '/liquidation-calculator' },
  { id: 'max-position-calculator', label: '可开计算器', icon: <AccountBalanceIcon />, path: '/max-position-calculator' },
  { id: 'entry-price-calculator', label: '开仓价格计算器', icon: <PriceChangeIcon />, path: '/entry-price-calculator' },
  { id: 'volatility-calculator', label: '波动率计算器', icon: <VolatilityIcon />, path: '/volatility-calculator' },
  { id: 'calculator', label: '计算器', icon: <CalculatorIcon />, path: '/calculator' },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state, setTheme } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  // 根据当前路径获取当前页面ID
  const getCurrentPageId = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem?.id || 'positions';
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleThemeToggle = () => {
    setTheme(state.theme === 'light' ? 'dark' : 'light');
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
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
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
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
