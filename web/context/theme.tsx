'use client'
import type { ThemeProviderProps } from 'next-themes'
import { HeroUIProvider } from '@heroui/react'
import { ThemeProvider } from 'next-themes'

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
