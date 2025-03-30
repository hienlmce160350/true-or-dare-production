import { useMediaQuery } from './use-media-query';

/**
 * Check if current screen is mobile (screen width < 768px)
 *
 * @returns
 */
export function useCheckMobile() {
  return useMediaQuery('(max-width: 767px)');
}

/**
 * Check if current screen is desktop (768px <= screen width < 1440px)
 *
 * @returns
 */
export function useCheckDesktop() {
  return useMediaQuery('(min-width: 768px) and (max-width: 1439px)');
}

/**
 * Check if current screen is desktop wide (>=1400px)
 *
 * @returns
 */
export function useCheckDesktopWide() {
  return useMediaQuery('(min-width: 1440px)');
}
