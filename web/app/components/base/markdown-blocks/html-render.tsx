import DOMPurify from 'dompurify'
/**
 * @fileoverview HTML渲染组件，用于安全地渲染HTML内容
 * 支持白名单标签和属性，防止XSS攻击
 */
import * as React from 'react'

type HtmlRenderProps = {
  content: string
  className?: string
  allowedTags?: string[]
  allowedAttributes?: Record<string, string[]>
}

// 默认允许的HTML标签
const DEFAULT_ALLOWED_TAGS = [
  'div',
  'span',
  'p',
  'br',
  'hr',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'del',
  'ins',
  'blockquote',
  'pre',
  'code',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'a',
  'img',
  'sub',
  'sup',
  'mark',
  'small',
  'abbr',
  'cite',
  'dfn',
  'time',
  'details',
  'summary',
]

// 默认允许的属性
const DEFAULT_ALLOWED_ATTRIBUTES = {
  '*': ['class', 'id', 'style', 'title', 'data-*'],
  'a': ['href', 'target', 'rel'],
  'img': ['src', 'alt', 'width', 'height'],
  'table': ['border', 'cellpadding', 'cellspacing'],
  'th': ['colspan', 'rowspan', 'scope'],
  'td': ['colspan', 'rowspan'],
  'details': ['open'],
  'time': ['datetime'],
}

const HtmlRender: React.FC<HtmlRenderProps> = ({
  content,
  className = '',
  allowedTags = DEFAULT_ALLOWED_TAGS,
  allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES,
}) => {
  // 检测是否包含HTML标签
  const containsHtml = /<[^>]+>/.test(content)

  if (!containsHtml) {
    // 如果不包含HTML标签，直接返回纯文本
    return <span className={className}>{content}</span>
  }

  // 配置DOMPurify
  const purifyConfig = {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: Object.keys(allowedAttributes).reduce((acc, tag) => {
      acc.push(...allowedAttributes[tag as keyof typeof allowedAttributes])
      return acc
    }, [] as string[]),
    ALLOW_DATA_ATTR: true,
    ALLOW_ARIA_ATTR: true,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM: false,
  }

  // 清理HTML内容
  const cleanHtml = DOMPurify.sanitize(content, purifyConfig)

  return (
    <div
      className={`html-render ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  )
}

export default HtmlRender
