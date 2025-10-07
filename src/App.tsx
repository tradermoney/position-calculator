import React from 'react';
import AppRouter from './components/Router/AppRouter';
import { StorageProvider } from './contexts/StorageProvider';
import { useStorageReady } from './hooks/useStorage';

function AppContent() {
  const { isStorageReady, error } = useStorageReady();

  // 在存储系统初始化完成前显示加载状态
  if (!isStorageReady) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: '#666',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div>正在初始化应用...</div>
        {error && (
          <div style={{ color: '#ff6b6b', fontSize: '14px' }}>
            存储初始化警告: {error}
          </div>
        )}
      </div>
    );
  }

  return <AppRouter />;
}

function App() {
  return (
    <StorageProvider>
      <AppContent />
    </StorageProvider>
  );
}

export default App;
