import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AppProvider, useAppContext } from '../../contexts/AppContext';
import { getTheme } from '../../styles/theme';
import AppLayout from '../Layout/AppLayout';
import Dashboard from '../../pages/Dashboard';
import PositionManagement from '../../pages/PositionManagement';
import AddPositionCalculator from '../../pages/AddPositionCalculator';
import PyramidCalculator from '../../pages/PyramidCalculator';
import Settings from '../../pages/Settings';

// 页面组件映射
const pageComponents = {
  dashboard: Dashboard,
  positions: PositionManagement,
  'add-position': AddPositionCalculator,
  pyramid: PyramidCalculator,
  settings: Settings,
};

function AppContent() {
  const { state } = useAppContext();
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  const theme = getTheme(state.theme);
  const PageComponent = pageComponents[currentPage as keyof typeof pageComponents] || Dashboard;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout currentPage={currentPage} onPageChange={setCurrentPage}>
        <PageComponent />
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
