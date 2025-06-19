/**
 * Responsive Utilities for VBTicket Application
 * 
 * This file contains utility functions and constants for handling responsive design
 * across the application. It provides consistent breakpoints, utility functions,
 * and responsive patterns.
 */

// Breakpoint constants (matching Tailwind CSS defaults)
export const BREAKPOINTS = {
  xs: 475,   // Extra small devices
  sm: 640,   // Small devices (landscape phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (desktops)
  xl: 1280,  // Extra large devices (large desktops)
  '2xl': 1536, // 2X large devices (larger desktops)
} as const;

// Mobile-first breakpoint queries
export const MEDIA_QUERIES = {
  xs: `(min-width: ${BREAKPOINTS.xs}px)`,
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
  '2xl': `(min-width: ${BREAKPOINTS['2xl']}px)`,
  
  // Max-width queries for specific ranges
  'max-xs': `(max-width: ${BREAKPOINTS.xs - 1}px)`,
  'max-sm': `(max-width: ${BREAKPOINTS.sm - 1}px)`,
  'max-md': `(max-width: ${BREAKPOINTS.md - 1}px)`,
  'max-lg': `(max-width: ${BREAKPOINTS.lg - 1}px)`,
  'max-xl': `(max-width: ${BREAKPOINTS.xl - 1}px)`,
  'max-2xl': `(max-width: ${BREAKPOINTS['2xl'] - 1}px)`,
} as const;

// Device type detection
export const DEVICE_TYPES = {
  mobile: MEDIA_QUERIES['max-md'],
  tablet: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
  desktop: MEDIA_QUERIES.lg,
} as const;

/**
 * Hook to get current breakpoint
 */
export function useBreakpoint() {
  if (typeof window === 'undefined') return 'sm';
  
  const width = window.innerWidth;
  
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/**
 * Check if current viewport matches a breakpoint
 */
export function matchesBreakpoint(breakpoint: keyof typeof BREAKPOINTS): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS[breakpoint];
}

/**
 * Check if current viewport is mobile
 */
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.md;
}

/**
 * Check if current viewport is tablet
 */
export function isTabletViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg;
}

/**
 * Check if current viewport is desktop
 */
export function isDesktopViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.lg;
}

/**
 * Responsive grid column utilities
 */
export const GRID_COLUMNS = {
  responsive: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  cards: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  stats: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  form: 'grid-cols-1 md:grid-cols-2',
  table: 'grid-cols-1',
} as const;

/**
 * Responsive spacing utilities
 */
export const SPACING = {
  container: 'px-4 sm:px-6 lg:px-8',
  section: 'py-8 sm:py-12 lg:py-16',
  card: 'p-4 sm:p-6 lg:p-8',
  gap: 'gap-4 sm:gap-6 lg:gap-8',
  'gap-sm': 'gap-2 sm:gap-3 lg:gap-4',
  'gap-lg': 'gap-6 sm:gap-8 lg:gap-12',
} as const;

/**
 * Responsive text utilities
 */
export const TEXT_SIZES = {
  'heading-xl': 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
  'heading-lg': 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
  'heading-md': 'text-lg sm:text-xl md:text-2xl lg:text-3xl',
  'heading-sm': 'text-base sm:text-lg md:text-xl lg:text-2xl',
  body: 'text-sm sm:text-base',
  caption: 'text-xs sm:text-sm',
} as const;

/**
 * Touch target utilities for mobile accessibility
 */
export const TOUCH_TARGETS = {
  button: 'min-h-[44px] min-w-[44px]',
  'button-sm': 'min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px]',
  'button-lg': 'min-h-[48px] min-w-[48px]',
  input: 'min-h-[44px]',
  'input-sm': 'min-h-[36px] sm:min-h-[40px]',
} as const;

/**
 * Responsive layout utilities
 */
export const LAYOUTS = {
  'flex-responsive': 'flex flex-col sm:flex-row',
  'flex-responsive-reverse': 'flex flex-col-reverse sm:flex-row',
  'items-responsive': 'items-start sm:items-center',
  'justify-responsive': 'justify-start sm:justify-between',
  'text-responsive': 'text-center sm:text-left',
} as const;

/**
 * Generate responsive class string based on breakpoint values
 */
export function generateResponsiveClasses(
  values: Partial<Record<keyof typeof BREAKPOINTS | 'base', string>>
): string {
  const classes: string[] = [];
  
  if (values.base) classes.push(values.base);
  if (values.xs) classes.push(`xs:${values.xs}`);
  if (values.sm) classes.push(`sm:${values.sm}`);
  if (values.md) classes.push(`md:${values.md}`);
  if (values.lg) classes.push(`lg:${values.lg}`);
  if (values.xl) classes.push(`xl:${values.xl}`);
  if (values['2xl']) classes.push(`2xl:${values['2xl']}`);
  
  return classes.join(' ');
}

/**
 * Common responsive patterns
 */
export const PATTERNS = {
  // Navigation patterns
  'nav-mobile': 'block md:hidden',
  'nav-desktop': 'hidden md:block',
  
  // Content patterns
  'content-mobile': 'block lg:hidden',
  'content-desktop': 'hidden lg:block',
  
  // Layout patterns
  'sidebar-mobile': 'w-full md:w-64 lg:w-72',
  'main-content': 'flex-1 min-w-0',
  
  // Card patterns
  'card-mobile': 'rounded-lg sm:rounded-xl',
  'card-padding': 'p-4 sm:p-6 lg:p-8',
  
  // Form patterns
  'form-grid': 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6',
  'form-actions': 'flex flex-col sm:flex-row gap-3 sm:gap-4',
} as const;

/**
 * Utility function to combine responsive classes
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get optimal image sizes for responsive images
 */
export function getResponsiveImageSizes(
  sizes: Partial<Record<keyof typeof BREAKPOINTS | 'base', number>>
): string {
  const sizeStrings: string[] = [];
  
  if (sizes.base) sizeStrings.push(`${sizes.base}px`);
  if (sizes.sm) sizeStrings.push(`(min-width: ${BREAKPOINTS.sm}px) ${sizes.sm}px`);
  if (sizes.md) sizeStrings.push(`(min-width: ${BREAKPOINTS.md}px) ${sizes.md}px`);
  if (sizes.lg) sizeStrings.push(`(min-width: ${BREAKPOINTS.lg}px) ${sizes.lg}px`);
  if (sizes.xl) sizeStrings.push(`(min-width: ${BREAKPOINTS.xl}px) ${sizes.xl}px`);
  if (sizes['2xl']) sizeStrings.push(`(min-width: ${BREAKPOINTS['2xl']}px) ${sizes['2xl']}px`);
  
  return sizeStrings.reverse().join(', ');
}

/**
 * Responsive container queries
 */
export const CONTAINER_QUERIES = {
  'card-sm': '@container (min-width: 300px)',
  'card-md': '@container (min-width: 400px)',
  'card-lg': '@container (min-width: 500px)',
  'sidebar-sm': '@container (min-width: 200px)',
  'sidebar-md': '@container (min-width: 250px)',
  'sidebar-lg': '@container (min-width: 300px)',
} as const;
