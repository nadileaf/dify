import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { LinkClickMessage } from './link-click-interceptor'

export type UseLinkClickHandlerOptions = {
  allowedOrigins?: string[]
  onInternalLink?: (pathname: string) => void
  onExternalLink?: (url: string) => void
  debug?: boolean
}

const DEFAULT_OPTIONS: UseLinkClickHandlerOptions = {
  allowedOrigins: [],
  debug: false,
}

function log(debug: boolean, ...args: any[]) {
  if (debug)
    console.log('[Dify Link Handler]', ...args)
}

function isInternalLink(url: string): boolean {
  try {
    const linkUrl = new URL(url, window.location.origin)
    return linkUrl.origin === window.location.origin
  }
  catch {
    return false
  }
}

export function useLinkClickHandler(options?: UseLinkClickHandlerOptions) {
  const router = useRouter()
  const config = { ...DEFAULT_OPTIONS, ...options }

  useEffect(() => {
    const handleMessage = (event: MessageEvent<LinkClickMessage>) => {
      if (config.allowedOrigins && config.allowedOrigins.length > 0) {
        if (!config.allowedOrigins.includes(event.origin)) {
          log(config.debug!, 'Message from unauthorized origin:', event.origin)
          return
        }
      }

      if (event.data?.type !== 'dify-link-click')
        return

      const { url, text } = event.data.payload

      if (!url) {
        log(config.debug!, 'Invalid message: missing URL')
        return
      }

      log(config.debug!, 'Received link click:', { url, text })

      try {
        if (isInternalLink(url)) {
          const linkUrl = new URL(url, window.location.origin)
          const pathname = linkUrl.pathname.replace(/^\//, '')
          const search = linkUrl.search
          const hash = linkUrl.hash

          log(config.debug!, 'Internal link detected:', { pathname, search, hash })

          if (config.onInternalLink) {
            config.onInternalLink(pathname)
          }
          else {
            const currentParams = new URLSearchParams(window.location.search)
            currentParams.set('sub', pathname + search + hash)
            router.push(`${window.location.pathname}?${currentParams.toString()}`)
            log(config.debug!, 'Navigated to sub pane:', pathname + search + hash)
          }
        }
        else {
          log(config.debug!, 'External link detected:', url)

          if (config.onExternalLink) {
            config.onExternalLink(url)
          }
          else {
            window.open(url, '_blank', 'noopener,noreferrer')
            log(config.debug!, 'Opened in new window:', url)
          }
        }
      }
      catch (error) {
        console.error('[Dify Link Handler] Error processing link:', error)
      }
    }

    window.addEventListener('message', handleMessage)
    log(config.debug!, 'Link click handler initialized')

    return () => {
      window.removeEventListener('message', handleMessage)
      log(config.debug!, 'Link click handler destroyed')
    }
  }, [router, config])
}
