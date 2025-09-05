import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Skeleton,
  Card,
  CardContent,
} from '@mui/material';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = 40, message, fullScreen = false }: LoadingSpinnerProps) {
  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" color="textSecondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="rgba(255, 255, 255, 0.8)"
        zIndex={9999}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight={200}
    >
      {content}
    </Box>
  );
}

interface SkeletonCardProps {
  lines?: number;
  showAvatar?: boolean;
}

export function SkeletonCard({ lines = 3, showAvatar = false }: SkeletonCardProps) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          {showAvatar && <Skeleton variant="circular" width={40} height={40} />}
          <Box flex={1}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        </Box>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            width={index === lines - 1 ? '80%' : '100%'}
            height={20}
            sx={{ mb: 1 }}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <Box>
      {/* 表头 */}
      <Box display="flex" gap={2} mb={2}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} variant="text" width="100%" height={32} />
        ))}
      </Box>
      {/* 表格行 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box key={rowIndex} display="flex" gap={2} mb={1}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width="100%" height={24} />
          ))}
        </Box>
      ))}
    </Box>
  );
}

export default LoadingSpinner;
