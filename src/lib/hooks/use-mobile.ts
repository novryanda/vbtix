import * as React from "react"
import { BREAKPOINTS, MEDIA_QUERIES } from "~/lib/responsive-utils"

const MOBILE_BREAKPOINT = BREAKPOINTS.md

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

/**
 * Enhanced responsive hooks using the new responsive utilities
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<string>('sm')

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth

      if (width >= BREAKPOINTS['2xl']) setBreakpoint('2xl')
      else if (width >= BREAKPOINTS.xl) setBreakpoint('xl')
      else if (width >= BREAKPOINTS.lg) setBreakpoint('lg')
      else if (width >= BREAKPOINTS.md) setBreakpoint('md')
      else if (width >= BREAKPOINTS.sm) setBreakpoint('sm')
      else setBreakpoint('xs')
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`)
    const onChange = () => {
      setIsTablet(window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg)
    }
    mql.addEventListener("change", onChange)
    setIsTablet(window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isTablet
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`)
    const onChange = () => {
      setIsDesktop(window.innerWidth >= BREAKPOINTS.lg)
    }
    mql.addEventListener("change", onChange)
    setIsDesktop(window.innerWidth >= BREAKPOINTS.lg)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isDesktop
}
