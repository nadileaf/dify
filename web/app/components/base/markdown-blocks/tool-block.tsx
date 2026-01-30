import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useChatContext } from '../chat/chat/context'

const hasEndTool = (children: any): boolean => {
  if (typeof children === 'string')
    return children.includes('[ENDTOOLFLAG]')

  if (Array.isArray(children))
    return children.some(child => hasEndTool(child))

  if (children?.props?.children)
    return hasEndTool(children.props.children)

  return false
}

const hasToolComplete = (children: any): boolean => {
  if (typeof children === 'string')
    return children.includes('[TOOLCOMPLETE]')

  if (Array.isArray(children))
    return children.some(child => hasToolComplete(child))

  if (children?.props?.children)
    return hasToolComplete(children.props.children)

  return false
}

const removeEndTool = (children: any): any => {
  if (typeof children === 'string')
    return children.replace('[ENDTOOLFLAG]', '').replace('[TOOLCOMPLETE]', '')

  if (Array.isArray(children))
    return children.map(child => removeEndTool(child))

  if (children?.props?.children) {
    return React.cloneElement(
      children,
      {
        ...children.props,
        children: removeEndTool(children.props.children),
      },
    )
  }

  return children
}

const extractToolName = (children: any): string => {
  if (typeof children === 'string') {
    const content = children.replace('[ENDTOOLFLAG]', '').replace('[TOOLCOMPLETE]', '').trim()
    if (!content) return 'Tool'

    const lines = content.split('\n').filter(line => line.trim())
    if (lines.length === 0) return 'Tool'

    // 尝试从第一行提取工具名称
    const firstLine = lines[0].trim()
    // 如果第一行看起来像 JSON，使用第二行
    if (firstLine.startsWith('{') || firstLine.startsWith('[') || firstLine.startsWith('('))
      return lines.length > 1 ? lines[1].trim().split(' ')[0] : 'Tool'

    return firstLine.split(' ')[0] || 'Tool'
  }

  if (Array.isArray(children) && children.length > 0) {
    const firstString = children.find(child => typeof child === 'string' && child.trim())
    return firstString ? extractToolName(firstString) : 'Tool'
  }

  if (children?.props?.children)
    return extractToolName(children.props.children)

  return 'Tool'
}

const hasToolContent = (children: any): boolean => {
  if (typeof children === 'string') {
    const content = children.replace('[ENDTOOLFLAG]', '').trim()
    // 检查是否有多行内容（第一行是工具名，第二行开始才是输出内容）
    const lines = content.split('\n')
    if (lines.length <= 1) return false

    // 检查第二行及以后是否有非空内容
    const hasContentAfterFirstLine = lines.slice(1).some(line => line.trim().length > 0)
    return hasContentAfterFirstLine
  }

  if (Array.isArray(children)) {
    if (children.length === 0) return false

    // 如果有多个非空子元素，说明有内容
    const nonEmptyChildren = children.filter((child) => {
      if (typeof child === 'string') {
        const content = child.replace('[ENDTOOLFLAG]', '').trim()
        return content.length > 0
      }
      return child && typeof child !== 'string'
    })

    // 多个非空元素，或者包含非字符串元素
    if (nonEmptyChildren.length > 1) return true
    if (nonEmptyChildren.some(child => typeof child !== 'string')) return true

    // 只有一个字符串元素，检查是否有多行
    if (nonEmptyChildren.length === 1 && typeof nonEmptyChildren[0] === 'string')
      return hasToolContent(nonEmptyChildren[0])

    return false
  }

  if (children?.props?.children)
    return hasToolContent(children.props.children)

  return false
}

const useToolTimer = (children: any) => {
  const { isResponding } = useChatContext()
  const [startTime] = useState(() => Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const shouldStop = hasToolComplete(children) || !isResponding

    if (shouldStop && !isComplete) {
      setIsComplete(true)
      return
    }

    if (isComplete) return

    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 100) / 10)
    }, 100)

    return () => {
      if (timerRef.current)
        clearInterval(timerRef.current)
    }
  }, [startTime, isComplete, children, isResponding])

  return { elapsedTime, isComplete }
}

const ToolBlock = ({ children, ...props }: React.ComponentProps<'div'>) => {
  const { elapsedTime } = useToolTimer(children)
  const displayContent = removeEndTool(children)
  const toolName = extractToolName(children)
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const isToolBlock = (props as any)['data-tool'] ?? false

  if (!isToolBlock)
    return (<div {...props}>{children}</div>)

  // 状态判断：根据 [TOOLCOMPLETE] 标记来判断
  // 有 [TOOLCOMPLETE] → </tool> 后面有内容 → complete
  // 没有 [TOOLCOMPLETE] → </tool> 后面暂无内容 → loading
  const status = hasToolComplete(children) ? 'complete' : 'loading'

  return (
    <div className="group my-2 overflow-hidden rounded-lg border border-components-panel-border bg-components-panel-bg transition-all">
      <div
        className="flex cursor-pointer select-none items-center justify-between p-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {status === 'loading' && (
            <svg
              className="h-4 w-4 animate-spin text-text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle
                opacity="0.25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                opacity="0.75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {status === 'complete' && (
            <svg
              className="h-4 w-4 text-text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          <span className="system-sm-semibold text-text-secondary">
            {status === 'loading' ? t('common.chat.toolCalling') : t('common.chat.toolComplete')}
          </span>
          <span className="system-xs-medium text-text-tertiary">
            {toolName}
          </span>
          {status === 'complete' && (
            <span className="system-xs-regular text-text-quaternary">
              ({elapsedTime.toFixed(1)}s)
            </span>
          )}
        </div>
        <svg
          className={`h-4 w-4 text-text-tertiary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      {isOpen && (
        <div className="border-t border-components-panel-border bg-components-panel-bg-alt px-3 py-2 text-text-secondary">
          <div className="system-xs-regular">
            {displayContent}
          </div>
        </div>
      )}
    </div>
  )
}

export default ToolBlock
