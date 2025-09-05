import React, { ReactNode } from 'react';
import {
  Box,
  Container,
  useTheme,
  useMediaQuery,
  Breakpoint,
} from '@mui/material';

interface ResponsiveContainerProps {
  children: ReactNode;
  maxWidth?: Breakpoint | false;
  disableGutters?: boolean;
  centerContent?: boolean;
  minHeight?: string | number;
  padding?: number | string;
}

export function ResponsiveContainer({
  children,
  maxWidth = 'lg',
  disableGutters = false,
  centerContent = false,
  minHeight,
  padding,
}: ResponsiveContainerProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Container
      maxWidth={maxWidth}
      disableGutters={disableGutters}
      sx={{
        minHeight,
        padding: padding || (isMobile ? 1 : isTablet ? 2 : 3),
        ...(centerContent && {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }),
      }}
    >
      {children}
    </Container>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  spacing?: number;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function ResponsiveGrid({
  children,
  spacing = 3,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
}: ResponsiveGridProps) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));

  let currentColumns = columns.xl || 4;
  if (isXs) currentColumns = columns.xs || 1;
  else if (isSm) currentColumns = columns.sm || 2;
  else if (isMd) currentColumns = columns.md || 3;
  else if (isLg) currentColumns = columns.lg || 4;

  return (
    <Box
      display="grid"
      gridTemplateColumns={`repeat(${currentColumns}, 1fr)`}
      gap={spacing}
      width="100%"
    >
      {children}
    </Box>
  );
}

interface FlexContainerProps {
  children: ReactNode;
  direction?: 'row' | 'column';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  wrap?: boolean;
  gap?: number;
  responsive?: boolean;
}

export function FlexContainer({
  children,
  direction = 'row',
  justify = 'flex-start',
  align = 'stretch',
  wrap = false,
  gap = 0,
  responsive = false,
}: FlexContainerProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const responsiveDirection = responsive && isMobile ? 'column' : direction;

  return (
    <Box
      display="flex"
      flexDirection={responsiveDirection}
      justifyContent={justify}
      alignItems={align}
      flexWrap={wrap ? 'wrap' : 'nowrap'}
      gap={gap}
      width="100%"
    >
      {children}
    </Box>
  );
}

interface ResponsiveCardProps {
  children: ReactNode;
  elevation?: number;
  padding?: number;
  minHeight?: string | number;
  hover?: boolean;
}

export function ResponsiveCard({
  children,
  elevation = 1,
  padding,
  minHeight,
  hover = false,
}: ResponsiveCardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        boxShadow: theme.shadows[elevation],
        padding: padding || (isMobile ? 2 : 3),
        minHeight,
        transition: 'all 0.3s ease-in-out',
        ...(hover && {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[elevation + 2],
          },
        }),
      }}
    >
      {children}
    </Box>
  );
}

interface HideOnMobileProps {
  children: ReactNode;
  breakpoint?: 'xs' | 'sm' | 'md';
}

export function HideOnMobile({ children, breakpoint = 'sm' }: HideOnMobileProps) {
  const theme = useTheme();
  const shouldHide = useMediaQuery(theme.breakpoints.down(breakpoint));

  if (shouldHide) {
    return null;
  }

  return <>{children}</>;
}

interface ShowOnMobileProps {
  children: ReactNode;
  breakpoint?: 'xs' | 'sm' | 'md';
}

export function ShowOnMobile({ children, breakpoint = 'sm' }: ShowOnMobileProps) {
  const theme = useTheme();
  const shouldShow = useMediaQuery(theme.breakpoints.down(breakpoint));

  if (!shouldShow) {
    return null;
  }

  return <>{children}</>;
}

export default ResponsiveContainer;
