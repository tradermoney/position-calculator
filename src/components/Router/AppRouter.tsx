import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AppProvider, useAppContext } from '../../contexts/AppContext';
import AppLayout from '../Layout/AppLayout';
import Dashboard from '../../pages/Dashboard';
import PositionManagement from '../../pages/PositionManagement';
import AddPositionCalculator from '../../pages/AddPositionCalculator';
import PyramidCalculator from '../../pages/PyramidCalculator';
import Settings from '../../pages/Settings';
import { setPageTitle, PageKey } from '../../utils/titleManager';

// 路由路径映射
const routePathMap = {
  '/': 'positions',
  '/dashboard': 'dashboard',
  '/positions': 'positions',
  '/add-position': 'add-position',
  '/pyramid': 'pyramid',
  '/settings': 'settings',
} as const;

// 根据路径获取页面键名
function getPageKeyFromPath(pathname: string): PageKey {
  return (routePathMap[pathname as keyof typeof routePathMap] || 'positions') as PageKey;
}

function AppContent() {
  const { state } = useAppContext();
  const location = useLocation();

  // 当路由变化时更新标题
  useEffect(() => {
    const pageKey = getPageKeyFromPath(location.pathname);
    setPageTitle(pageKey);
  }, [location.pathname]);

  // 创建动态主题
  const theme = createTheme({
    palette: {
      mode: state.theme,
      primary: {
        main: '#1976d2',
      },
      background: {
        default: state.theme === 'dark' ? '#121212' : '#fafafa',
        paper: state.theme === 'dark' ? '#1e1e1e' : '#ffffff',
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/positions" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/positions" element={<PositionManagement />} />
          <Route path="/add-position" element={<AddPositionCalculator />} />
          <Route path="/pyramid" element={<PyramidCalculator />} />
          <Route path="/settings" element={<Settings />} />
          {/* 404 重定向到仓位管理页面 */}
          <Route path="*" element={<Navigate to="/positions" replace />} />
        </Routes>
      </AppLayout>
    </ThemeProvider>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
