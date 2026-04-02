import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useChatContext } from '../chat/chat/context'

const extractTextContent = (children: any): string => {
  if (typeof children === 'string')
    return children

  if (Array.isArray(children))
    return children.map(extractTextContent).join('')

  if (children?.props?.children)
    return extractTextContent(children.props.children)

  return ''
}

const tryParseJSON = (content: string): any | null => {
  try {
    const trimmed = content.trim()
    if (!trimmed.startsWith('{'))
      return null
    return JSON.parse(trimmed)
  }
  catch {
    return null
  }
}

const isSkillJSON = (json: any): boolean => {
  return json
    && typeof json === 'object'
    && json.action === 'skill'
    && json.skill_name
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
    if (!content)
      return 'Tool'

    const lines = content.split('\n').filter(line => line.trim())
    if (lines.length === 0)
      return 'Tool'

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

    if (isComplete)
      return

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

const SkillDisplay = ({ skillData }: { skillData: any }) => {
  const { answer, progress, skill_arguments } = skillData

  const progressItems = progress ? progress.split('\n').filter((line: string) => line.trim()) : []

  return (
    <div className="space-y-3">
      {answer && (
        <div className="rounded-md bg-background-section-burn p-3">
          <div className="system-xs-medium text-text-secondary">
            {answer}
          </div>
        </div>
      )}

      {progressItems.length > 0 && (
        <div className="space-y-1.5">
          <div className="system-xs-semibold text-text-tertiary">
            执行进度
          </div>
          {progressItems.map((item: string, idx: number) => {
            const isChecked = item.includes('[x]') || item.includes('[X]')
            const text = item.replace(/^-\s*\[[x ]\]\s*/i, '')

            return (
              <div key={idx} className="flex items-start gap-2">
                <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded ${isChecked ? 'bg-text-accent' : 'border border-divider-regular'}`}>
                  {isChecked && (
                    <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`system-xs-regular ${isChecked ? 'text-text-tertiary' : 'text-text-secondary'}`}>
                  {text}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {skill_arguments && Object.keys(skill_arguments).length > 0 && (
        <details className="group/details">
          <summary className="system-xs-semibold cursor-pointer text-text-tertiary hover:text-text-secondary">
            <span className="inline-flex items-center gap-1">
              参数详情
              <svg className="h-3 w-3 transition-transform group-open/details:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </summary>
          <div className="mt-2 rounded-md bg-background-section-burn p-2">
            <pre className="system-xs-regular overflow-x-auto text-text-tertiary">
              {JSON.stringify(skill_arguments, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  )
}

const ToolBlock = ({ children, ...props }: React.ComponentProps<'div'>) => {
  const { elapsedTime } = useToolTimer(children)
  const displayContent = removeEndTool(children)
  const toolNameFromAttr = (props as any)['data-tool-name']
  const toolNameFromContent = extractToolName(children)

  const textContent = extractTextContent(displayContent)
  const jsonData = tryParseJSON(textContent)
  const skillName = jsonData?.skill_name || jsonData?.skill_id

  const toolName = toolNameFromAttr || skillName || toolNameFromContent
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
        className="flex cursor-pointer select-none items-start justify-between gap-2 p-3 sm:items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
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
          <span className="system-xs-medium max-w-[200px] truncate text-text-tertiary sm:max-w-none" title={toolName}>
            {toolName}
          </span>
          {status === 'complete' && (
            <span className="system-xs-regular whitespace-nowrap text-text-quaternary">
              (
              {elapsedTime.toFixed(1)}
              s)
            </span>
          )}
        </div>
        <svg
          className={`h-4 w-4 shrink-0 text-text-tertiary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
          {jsonData && isSkillJSON(jsonData)
            ? <SkillDisplay skillData={jsonData} />
            : (
                <div className="system-xs-regular overflow-x-auto break-words">
                  {displayContent}
                </div>
              )}
        </div>
      )}
    </div>
  )
}

export default ToolBlock
