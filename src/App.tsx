import React from 'react';
import AppRouter from './components/Router/AppRouter';
import { StorageProvider } from './contexts/StorageProvider';
import { useStorageReady } from './hooks/useStorage';

function AppContent() {
  const { isStorageReady, error } = useStorageReady();
  const [forceReady, setForceReady] = React.useState(false);
  const [loadingTime, setLoadingTime] = React.useState(0);

  // 计算加载时间
  React.useEffect(() => {
    if (!isStorageReady && !forceReady) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        setLoadingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isStorageReady, forceReady]);

  // 在存储系统初始化完成前显示加载状态
  if (!isStorageReady && !forceReady) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: '#666',
        flexDirection: 'column',
        gap: '16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div style={{ color: 'white', fontSize: '18px', fontWeight: 500 }}>
          正在初始化数据库...
        </div>
        <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
          已等待 {loadingTime} 秒
        </div>
        {error && (
          <div style={{ 
            color: '#ffeb3b', 
            fontSize: '14px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            padding: '8px 16px',
            borderRadius: '4px',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        {loadingTime >= 3 && (
          <button
            onClick={() => setForceReady(true)}
            style={{
              marginTop: '8px',
              padding: '10px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            跳过初始化，直接进入
          </button>
        )}
        <div style={{ 
          color: 'rgba(255, 255, 255, 0.6)', 
          fontSize: '12px',
          marginTop: '16px',
          maxWidth: '500px',
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          提示：如果长时间卡在这里，可能是浏览器不支持IndexedDB或被隐私设置阻止。
          {loadingTime < 3 && '请稍候...'}
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
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
