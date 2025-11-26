'use client'
/**
 * Enhanced EmbeddedChatbot with Query Parameters Support
 *
 * This file encapsulates all custom URL parameter handling logic to minimize
 * code conflicts when merging upstream changes from the open-source project.
 *
 * Supported Query Parameters:
 * - prompt: Auto-fill and auto-send message
 * - hideTitle: Hide the header/title bar
 * - backgroundColor: Custom background color (hides default gradient and background image)
 *
 * Usage:
 *   import EmbeddedChatbotWithQueryParams from './with-query-params'
 *   <EmbeddedChatbotWithQueryParams />
 *
 * Or with explicit props:
 *   <EmbeddedChatbotWithQueryParams
 *     initialPrompt="Hello"
 *     hideTitle={true}
 *     backgroundColor="#FFFFFF"
 *   />
 */

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import EmbeddedChatbot from './index'
import type { EmbeddedChatbotWrapperProps } from './index'

/**
 * Hook: Read and parse query parameters from URL
 */
export const useEmbeddedChatbotQueryParams = () => {
  const searchParams = useSearchParams()
  const [queryParams, setQueryParams] = useState<{
    prompt?: string
    hideTitle?: boolean
    backgroundColor?: string
  }>({})

  useEffect(() => {
    const prompt = searchParams.get('prompt') || undefined
    const hideTitle = searchParams.get('hideTitle') === 'true'
    const backgroundColor = searchParams.get('backgroundColor') || undefined

    setQueryParams({
      prompt,
      hideTitle,
      backgroundColor,
    })
  }, [searchParams])

  return queryParams
}

/**
 * Hook: Handle auto-send prompt functionality
 * Ensures the prompt is sent only once when conditions are met
 */
export const useAutoSendPrompt = (
  initialPrompt?: string,
  onSend?: (message: string, files: any[]) => void,
  options?: {
    currentConversationId?: string
    isResponding?: boolean
    inputDisabled?: boolean
  },
) => {
  const [promptSent, setPromptSent] = useState(false)

  useEffect(() => {
    if (
      initialPrompt
      && !promptSent
      && !options?.currentConversationId
      && !options?.isResponding
      && !options?.inputDisabled
      && onSend
    ) {
      const timer = setTimeout(() => {
        onSend(initialPrompt, [])
        setPromptSent(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [initialPrompt, promptSent, options?.currentConversationId, options?.isResponding, options?.inputDisabled, onSend])

  return { promptSent, setPromptSent }
}

/**
 * Hook: Calculate background styles based on custom color
 */
export const useBackgroundStyle = (
  backgroundColor?: string,
  currentConversationId?: string,
) => {
  const bgStyle = backgroundColor
    ? { backgroundColor }
    : undefined

  const bgClassName = backgroundColor
    ? undefined
    : (currentConversationId ? 'bg-white' : 'bg-gradient-to-b from-[#F6F5F2] to-[#F7F5F2]')

  const showDefaultBg = !currentConversationId && !backgroundColor

  return { bgStyle, bgClassName, showDefaultBg }
}

/**
 * Higher-Order Component: EmbeddedChatbot with Query Params Support
 *
 * This wrapper automatically reads URL parameters and passes them to EmbeddedChatbot.
 * All custom logic is isolated here to avoid conflicts during upstream merges.
 */
const EmbeddedChatbotWithQueryParams = (props: Partial<EmbeddedChatbotWrapperProps> = {}) => {
  const queryParams = useEmbeddedChatbotQueryParams()

  return (
    <EmbeddedChatbot
      initialPrompt={props.initialPrompt ?? queryParams.prompt}
      hideTitle={props.hideTitle ?? queryParams.hideTitle}
      backgroundColor={props.backgroundColor ?? queryParams.backgroundColor}
      {...props}
    />
  )
}

export default EmbeddedChatbotWithQueryParams
