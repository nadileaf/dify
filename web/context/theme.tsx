'use client'
import { ThemeProvider, type ThemeProviderProps } from 'next-themes'
import { HeroUIProvider } from '@heroui/react'

export default function _ThemeProvider({
  children,
  ...props
}: { children: React.ReactNode } & ThemeProviderProps) {
  return (
    <HeroUIProvider>
      <ThemeProvider {...props}>
        {children}
      </ThemeProvider>
    </HeroUIProvider>
  )
}
