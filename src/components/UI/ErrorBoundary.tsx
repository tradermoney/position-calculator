import React, { Component, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  BugReport as BugReportIcon,
} from '@mui/icons-material';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    
    // 这里可以添加错误日志上报
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="400px"
          p={3}
        >
          <Card sx={{ maxWidth: 600, width: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <ErrorIcon color="error" sx={{ fontSize: 48 }} />
                <Box>
                  <Typography variant="h5" gutterBottom>
                    出现了一些问题
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    应用遇到了意外错误，请尝试刷新页面
                  </Typography>
                </Box>
              </Box>

              {this.state.error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  <AlertTitle>错误详情</AlertTitle>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {this.state.error.message}
                  </Typography>
                </Alert>
              )}

              <Box display="flex" gap={2} justifyContent="center">
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleRetry}
                >
                  重试
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleReload}
                >
                  刷新页面
                </Button>
              </Box>

              {import.meta.env.DEV && this.state.errorInfo && (
                <Box mt={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    <BugReportIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    开发调试信息
                  </Typography>
                  <Alert severity="info">
                    <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
                      {this.state.errorInfo.componentStack}
                    </Typography>
                  </Alert>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  severity?: 'error' | 'warning' | 'info';
}

export function ErrorMessage({ 
  title = '操作失败', 
  message, 
  onRetry, 
  severity = 'error' 
}: ErrorMessageProps) {
  return (
    <Alert 
      severity={severity} 
      action={
        onRetry && (
          <Button color="inherit" size="small" onClick={onRetry}>
            重试
          </Button>
        )
      }
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </Alert>
  );
}

interface NotFoundProps {
  title?: string;
  message?: string;
  onGoBack?: () => void;
}

export function NotFound({ 
  title = '页面未找到', 
  message = '您访问的页面不存在或已被移除',
  onGoBack 
}: NotFoundProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="400px"
      textAlign="center"
      p={3}
    >
      <Typography variant="h1" color="textSecondary" sx={{ fontSize: '6rem', fontWeight: 300 }}>
        404
      </Typography>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        {message}
      </Typography>
      {onGoBack && (
        <Button variant="contained" onClick={onGoBack}>
          返回
        </Button>
      )}
    </Box>
  );
}

export default ErrorBoundary;
