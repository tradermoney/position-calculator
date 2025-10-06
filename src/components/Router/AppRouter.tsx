import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AppProvider, useAppContext } from '../../contexts/appContextHooks';
import AppLayout from '../Layout/AppLayout';
import Dashboard from '../../pages/Dashboard';
import AddPositionCalculator from '../../pages/AddPositionCalculator';
import PyramidCalculator from '../../pages/PyramidCalculator';
import PnLCalculatorPage from '../../pages/PnLCalculatorPage';
import TargetPriceCalculatorPage from '../../pages/TargetPriceCalculatorPage';
import LiquidationCalculatorPage from '../../pages/LiquidationCalculatorPage';
import MaxPositionCalculatorPage from '../../pages/MaxPositionCalculatorPage';
import EntryPriceCalculatorPage from '../../pages/EntryPriceCalculatorPage';
import VolatilityCalculator from '../../pages/VolatilityCalculator';
import CalculatorPage from '../../pages/CalculatorPage';
import KellyCalculatorPage from '../../pages/KellyCalculatorPage';
import { setPageTitle, PageKey } from '../../utils/titleManager';

// 路由路径映射
const routePathMap = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/add-position': 'add-position',
  '/pyramid': 'pyramid',
  '/pnl-calculator': 'pnl-calculator',
  '/target-price-calculator': 'target-price-calculator',
  '/liquidation-calculator': 'liquidation-calculator',
  '/max-position-calculator': 'max-position-calculator',
  '/entry-price-calculator': 'entry-price-calculator',
  '/volatility-calculator': 'volatility-calculator',
  '/kelly-calculator': 'kelly-calculator',
  '/calculator': 'calculator',
} as const;

// 根据路径获取页面键名
function getPageKeyFromPath(pathname: string): PageKey {
  return (routePathMap[pathname as keyof typeof routePathMap] || 'dashboard') as PageKey;
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
      MuiCardContent: {
        styleOverrides: {
          root: {
            '@media (max-width: 600px)': {
              padding: '8px',
              '&:last-child': {
                paddingBottom: '8px',
              },
            },
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
      MuiContainer: {
        styleOverrides: {
          root: {
            '@media (max-width: 600px)': {
              paddingLeft: '4px',
              paddingRight: '4px',
            },
          },
        },
      },
      MuiGrid: {
        styleOverrides: {
          root: {
            '@media (max-width: 600px)': {
              '&.MuiGrid-container': {
                margin: '-4px',
                width: 'calc(100% + 8px)',
                '& > .MuiGrid-item': {
                  padding: '4px',
                },
              },
            },
          },
        },
      },
      // @ts-expect-error - MuiBox type definition issue
      MuiBox: {
        styleOverrides: {
          root: {
            '@media (max-width: 600px)': {
              '& .MuiBox-root': {
                gap: '8px',
              },
            },
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-position" element={<AddPositionCalculator />} />
          <Route path="/pyramid" element={<PyramidCalculator />} />
          <Route path="/pnl-calculator" element={<PnLCalculatorPage />} />
          <Route path="/target-price-calculator" element={<TargetPriceCalculatorPage />} />
          <Route path="/liquidation-calculator" element={<LiquidationCalculatorPage />} />
          <Route path="/max-position-calculator" element={<MaxPositionCalculatorPage />} />
          <Route path="/entry-price-calculator" element={<EntryPriceCalculatorPage />} />
          <Route path="/volatility-calculator" element={<VolatilityCalculator />} />
          <Route path="/kelly-calculator" element={<KellyCalculatorPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />

          {/* 向后兼容性重定向 */}
          <Route path="/contract-calculator" element={<Navigate to="/pnl-calculator" replace />} />
          <Route path="/contract-calculator/pnl" element={<Navigate to="/pnl-calculator" replace />} />
          <Route path="/contract-calculator/target-price" element={<Navigate to="/target-price-calculator" replace />} />
          <Route path="/contract-calculator/liquidation" element={<Navigate to="/liquidation-calculator" replace />} />
          <Route path="/contract-calculator/max-position" element={<Navigate to="/max-position-calculator" replace />} />
          <Route path="/contract-calculator/entry-price" element={<Navigate to="/entry-price-calculator" replace />} />

          {/* 删除的仓位管理页面重定向到仪表盘 */}
          <Route path="/positions" element={<Navigate to="/dashboard" replace />} />

          {/* 404 重定向到仪表盘页面 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
    </ThemeProvider>
  );
}

export default function AppRouter() {
  // GitHub Pages 部署時需要設置 basename
  const basename = process.env.NODE_ENV === 'production' ? '/position-calculator' : '';
  
  return (
    <BrowserRouter basename={basename}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
