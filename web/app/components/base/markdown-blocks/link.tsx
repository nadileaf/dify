/**
 * @fileoverview Link component for rendering <a> tags in Markdown.
 * Extracted from the main markdown renderer for modularity.
 * Handles special rendering for "abbr:" type links for interactive chat actions.
 * Supports button-style links with modern design using heroUI.
 */
import React from 'react'
import { useChatContext } from '@/app/components/base/chat/chat/context'
import { isValidUrl } from './utils'

const parseStyleString = (styleString: string): React.CSSProperties => {
  const style: any = {}
  const declarations = styleString.split(';').filter(Boolean)

  declarations.forEach((declaration) => {
    const [property, value] = declaration.split(':').map(s => s.trim())
    if (property && value) {
      const camelCaseProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
      style[camelCaseProperty] = value
    }
  })

  return style as React.CSSProperties
}

const hasButtonElement = (children: React.ReactNode): boolean => {
  return React.Children.toArray(children).some((child) => {
    if (React.isValidElement(child)) {
      // 检测原生 button 元素
      if (child.type === 'button')
        return true
      // 检测 MarkdownButton 组件（通过 displayName 或其他属性）
      if (typeof child.type === 'function' && (child.type as any).displayName === 'MarkdownButton')
        return true
      // 递归检查子元素
      const props = child.props as any
      if (props?.children)
        return hasButtonElement(props.children)
    }
    return false
  })
}

const extractButtonText = (children: React.ReactNode): string => {
  const extracted: string[] = []

  React.Children.forEach(children, (child) => {
    if (typeof child === 'string') {
      extracted.push(child)
    }
    else if (React.isValidElement(child)) {
      const props = child.props as any
      // 对于 MarkdownButton 组件，从 node.children 中提取文本
      if (typeof child.type === 'function' && (child.type as any).displayName === 'MarkdownButton') {
        const nodeChildren = props?.node?.children
        if (nodeChildren && nodeChildren[0]?.value)
          extracted.push(nodeChildren[0].value)
      }
      else if (props?.children) {
        extracted.push(extractButtonText(props.children))
      }
    }
  })

  return extracted.join('')
}

const extractButtonStyle = (children: React.ReactNode): React.CSSProperties | undefined => {
  for (const child of React.Children.toArray(children)) {
    if (React.isValidElement(child)) {
      const props = child.props as any
      // 检测原生 button 元素的 style
      if (child.type === 'button' && props?.style)
        return props.style as React.CSSProperties

      // 检测 MarkdownButton 组件的 style（从 node.properties.style）
      if (typeof child.type === 'function' && (child.type as any).displayName === 'MarkdownButton') {
        const nodeStyle = props?.node?.properties?.style
        if (nodeStyle) {
          if (typeof nodeStyle === 'string')
            return parseStyleString(nodeStyle)

          return nodeStyle as React.CSSProperties
        }
      }

      // 递归检查子元素
      if (props?.children) {
        const style = extractButtonStyle(props.children)
        if (style)
          return style
      }
    }
  }
  return undefined
}

const Link = ({ node, children, ...props }: any) => {
  const { onSend } = useChatContext()
  const commonClassName = 'cursor-pointer underline !decoration-primary-700 decoration-dashed'
  const href = props.href || node.properties?.href

  // Button-style link: [<button>Text</button>](url)
  if (href && hasButtonElement(children) && isValidUrl(href)) {
    const buttonText = extractButtonText(children)
    const customStyle = extractButtonStyle(children)

    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="!inline-flex !h-8 !items-center !justify-center !rounded-lg !border !border-components-button-primary-border !bg-components-button-primary-bg !px-3.5 !text-[13px] !font-medium !leading-4 !text-components-button-primary-text !no-underline !shadow !transition-all !duration-200 hover:!border-components-button-primary-border-hover hover:!bg-components-button-primary-bg-hover"
        style={customStyle}
      >
        {buttonText}
      </a>
    )
  }

  if (node.properties?.href && node.properties.href?.toString().startsWith('abbr')) {
    const hidden_text = decodeURIComponent(node.properties.href.toString().split('abbr:')[1])

    return <abbr className={commonClassName} onClick={() => onSend?.(hidden_text)} title={node.children[0]?.value || ''}>{node.children[0]?.value || ''}</abbr>
  }
  else {
    if (href && /^#[a-zA-Z0-9_-]+$/.test(href.toString())) {
      const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        // scroll to target element if exists within the answer container
        const answerContainer = e.currentTarget.closest('.chat-answer-container')

        if (answerContainer) {
          const targetId = CSS.escape(href.toString().substring(1))
          const targetElement = answerContainer.querySelector(`[id="${targetId}"]`)
          if (targetElement)
            targetElement.scrollIntoView({ behavior: 'smooth' })
        }
      }
      return <a href={href} onClick={handleClick} className={commonClassName}>{children || 'ScrollView'}</a>
    }

    if (!href || !isValidUrl(href))
      return <span>{children}</span>

    return <a href={href} target="_blank" rel="noopener noreferrer" className={commonClassName}>{children || 'Download'}</a>
  }
}

export default Link
