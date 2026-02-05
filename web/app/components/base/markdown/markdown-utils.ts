/**
 * @fileoverview Utility functions for preprocessing Markdown content.
 * These functions were extracted from the main markdown renderer for better separation of concerns.
 * Includes preprocessing for LaTeX and custom "think" tags.
 */
import { flow } from 'lodash-es'
import { ALLOW_UNSAFE_DATA_SCHEME } from '@/config'

export const preprocessLaTeX = (content: string) => {
  if (typeof content !== 'string')
    return content

  const codeBlockRegex = /```[\s\S]*?```/g
  const codeBlocks = content.match(codeBlockRegex) || []
  const escapeReplacement = (str: string) => str.replace(/\$/g, '_TMP_REPLACE_DOLLAR_')
  let processedContent = content.replace(codeBlockRegex, 'CODE_BLOCK_PLACEHOLDER')

  processedContent = flow([
    (str: string) => str.replace(/\\\[(.*?)\\\]/g, (_, equation) => `$$${equation}$$`),
    (str: string) => str.replace(/\\\[([\s\S]*?)\\\]/g, (_, equation) => `$$${equation}$$`),
    (str: string) => str.replace(/\\\((.*?)\\\)/g, (_, equation) => `$$${equation}$$`),
    (str: string) => str.replace(/(^|[^\\])\$(.+?)\$/g, (_, prefix, equation) => `${prefix}$${equation}$`),
  ])(processedContent)

  codeBlocks.forEach((block) => {
    processedContent = processedContent.replace('CODE_BLOCK_PLACEHOLDER', escapeReplacement(block))
  })

  processedContent = processedContent.replace(/_TMP_REPLACE_DOLLAR_/g, '$')

  return processedContent
}

export const preprocessThinkTag = (content: string) => {
  const thinkOpenTagRegex = /(<think>\n)+/g
  const thinkCloseTagRegex = /\n<\/think>/g
  return flow([
    (str: string) => str.replace(thinkOpenTagRegex, '<details data-think=true>\n'),
    (str: string) => str.replace(thinkCloseTagRegex, '\n[ENDTHINKFLAG]</details>'),
    (str: string) => str.replace(/(<\/details>)(?![^\S\r\n]*[\r\n])(?![^\S\r\n]*$)/g, '$1\n'),
  ])(content)
}

export const preprocessToolTag = (content: string) => {
  // 使用前瞻断言检查 </tool> 后是否有非空内容，但不消费字符
  const toolBlockRegex = /<tool(?:\s+name="([^"]*)")?\s*>([\s\S]*?)<\/tool>(\s*)(?=(\S)|$)/g

  return content.replace(toolBlockRegex, (match, toolName, toolContent, whitespace, nextChar) => {
    // nextChar 通过前瞻捕获，不会从原字符串中移除
    const hasOutputAfter = nextChar && nextChar.trim().length > 0
    const completeFlag = hasOutputAfter ? '[TOOLCOMPLETE]' : ''
    const nameAttr = toolName ? ` data-tool-name="${toolName}"` : ''

    // 不输出 nextChar，因为它还在原字符串中
    return `<div data-tool=true${nameAttr}>${toolContent}${completeFlag}[ENDTOOLFLAG]</div>${whitespace}`
  })
}

/**
 * Transforms a URI for use in react-markdown, ensuring security and compatibility.
 * This function is designed to work with react-markdown v9+ which has stricter
 * default URL handling.
 *
 * Behavior:
 * 1. Always allows the custom 'abbr:' protocol.
 * 2. Always allows page-local fragments (e.g., "#some-id").
 * 3. Always allows protocol-relative URLs (e.g., "//example.com/path").
 * 4. Always allows purely relative paths (e.g., "path/to/file", "/abs/path").
 * 5. Allows absolute URLs if their scheme is in a permitted list (case-insensitive):
 *    'http:', 'https:', 'mailto:', 'xmpp:', 'irc:', 'ircs:'.
 * 6. Intelligently distinguishes colons used for schemes from colons within
 *    paths, query parameters, or fragments of relative-like URLs.
 * 7. Returns the original URI if allowed, otherwise returns `undefined` to
 *    signal that the URI should be removed/disallowed by react-markdown.
 */
export const customUrlTransform = (uri: string): string | undefined => {
  const PERMITTED_SCHEME_REGEX = /^(https?|ircs?|mailto|xmpp|abbr):$/i

  if (uri.startsWith('#'))
    return uri

  if (uri.startsWith('//'))
    return uri

  const colonIndex = uri.indexOf(':')

  if (colonIndex === -1)
    return uri

  const slashIndex = uri.indexOf('/')
  const questionMarkIndex = uri.indexOf('?')
  const hashIndex = uri.indexOf('#')

  if (
    (slashIndex !== -1 && colonIndex > slashIndex)
    || (questionMarkIndex !== -1 && colonIndex > questionMarkIndex)
    || (hashIndex !== -1 && colonIndex > hashIndex)
  )
    return uri

  const scheme = uri.substring(0, colonIndex + 1).toLowerCase()
  if (PERMITTED_SCHEME_REGEX.test(scheme))
    return uri

  if (ALLOW_UNSAFE_DATA_SCHEME && scheme === 'data:')
    return uri

  return undefined
}

/**
 * 预处理自定义HTML块，将 :::html 语法转换为特殊的代码块
 * 这样可以避免与现有的HTML处理逻辑冲突
 */
export const preprocessCustomHtml = (content: string) => {
  if (typeof content !== 'string')
    return content

  // 匹配 :::html 代码块
  const customHtmlRegex = /:::html\s*\n([\s\S]*?)\n:::/g

  // 将自定义HTML块转换为特殊的代码块，使用 'custom-html' 作为语言标识
  const processedContent = content.replace(customHtmlRegex, (match, htmlContent) => {
    // 清理HTML内容的首尾空白
    const cleanHtml = htmlContent.trim()
    return `\`\`\`custom-html\n${cleanHtml}\n\`\`\``
  })

  return processedContent
}
