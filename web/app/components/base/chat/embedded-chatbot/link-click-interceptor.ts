/**
 * Dify Chatbot 链接点击拦截器
 * 用于拦截 Chatbot 中的链接点击事件，并通过 postMessage 通知父页面
 *
 * 使用场景：
 * - 当 Chatbot 以 iframe 形式嵌入时
 * - 需要在父页面控制链接打开方式（内部链接在侧边栏打开，外部链接新窗口打开）
 *
 * 集成方式：
 * 在 Chatbot 初始化时调用 initLinkClickInterceptor()
 */

export type LinkClickMessage = {
  type: 'dify-link-click'
  payload: {
    url: string
    text?: string
    timestamp: number
  }
}

export type LinkClickInterceptorConfig = {
  targetOrigin?: string
  debug?: boolean
  shouldInterceptLink?: (link: HTMLAnchorElement) => boolean
}

const DEFAULT_CONFIG: Required<LinkClickInterceptorConfig> = {
  targetOrigin: '*',
  debug: false,
  shouldInterceptLink: () => true,
}

let initialized = false
let config: Required<LinkClickInterceptorConfig> = DEFAULT_CONFIG

function log(...args: any[]) {
  if (config.debug)
    console.log('[Dify Link Interceptor]', ...args)
}

function isHashLink(href: string): boolean {
  try {
    const url = new URL(href, window.location.href)
    return url.origin === window.location.origin
      && url.pathname === window.location.pathname
      && url.hash.startsWith('#')
  }
  catch {
    return false
  }
}

function isDangerousProtocol(href: string): boolean {
  // eslint-disable-next-line sonarjs/code-eval
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  const protocol = href.trim().toLowerCase()
  return dangerousProtocols.some(p => protocol.startsWith(p))
}

function handleLinkClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  const link = target.closest('a') as HTMLAnchorElement | null

  log('Click detected on element:', target.tagName, target.className)

  if (!link || !link.href) {
    log('Not a link or no href, skipping')
    return
  }

  log('Link found:', {
    href: link.href,
    text: link.textContent?.substring(0, 50),
    hasParent: window.parent !== window,
  })

  if (isDangerousProtocol(link.href)) {
    log('Blocked dangerous protocol:', link.href)
    event.preventDefault()
    event.stopPropagation()
    return
  }

  if (isHashLink(link.href)) {
    log('Allowing hash link to navigate normally:', link.href)
    return
  }

  if (!config.shouldInterceptLink(link)) {
    log('Link interceptor skipped by shouldInterceptLink:', link.href)
    return
  }

  log('Intercepting link:', link.href)
  event.preventDefault()
  event.stopPropagation()

  const message: LinkClickMessage = {
    type: 'dify-link-click',
    payload: {
      url: link.href,
      text: link.textContent || undefined,
      timestamp: Date.now(),
    },
  }

  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, config.targetOrigin)
      log('Link click message sent:', message)
    }
    else {
      log('Not in iframe, opening link with default behavior')
      if (link.target === '_blank')
        window.open(link.href, '_blank', 'noopener,noreferrer')
      else
        window.location.href = link.href
    }
  }
  catch (error) {
    console.error('[Dify Link Interceptor] Failed to send message:', error)
    window.open(link.href, '_blank', 'noopener,noreferrer')
  }
}

export function initLinkClickInterceptor(userConfig?: LinkClickInterceptorConfig) {
  if (initialized) {
    log('Already initialized, skipping')
    return () => {
      // Already initialized, nothing to clean up
    }
  }

  config = { ...DEFAULT_CONFIG, ...userConfig }

  const initListener = () => {
    document.addEventListener('click', handleLinkClick, true)
    initialized = true
    log('Link click interceptor initialized', config)
    log('Total links found on page:', document.querySelectorAll('a').length)
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', initListener)
  else
    initListener()

  return () => {
    document.removeEventListener('click', handleLinkClick, true)
    initialized = false
    log('Link click interceptor destroyed')
  }
}

export function isLinkClickInterceptorInitialized(): boolean {
  return initialized
}
