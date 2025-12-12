import { getProcessedSystemVariablesFromUrlParams } from '../utils'

export type UrlParamsResult = {
  userId?: string
  conversationId?: string
  isNewConversation: boolean
  prompt?: string
}

export async function parseUrlParams(): Promise<UrlParamsResult> {
  const urlParams = new URLSearchParams(window.location.search)
  const systemVariables = await getProcessedSystemVariablesFromUrlParams()

  const conversationIdRaw = systemVariables.conversation_id
  const isNewConversation = conversationIdRaw === 'new'
  const conversationId = isNewConversation ? undefined : conversationIdRaw

  return {
    userId: systemVariables.user_id,
    conversationId,
    isNewConversation,
    prompt: urlParams.get('prompt') || undefined,
  }
}

export function clearUrlParams(): void {
  const url = new URL(window.location.href)
  const paramsToRemove = ['sys.conversation_id', 'prompt']

  paramsToRemove.forEach((param) => {
    url.searchParams.delete(param)
  })

  window.history.replaceState({}, '', url.toString())
}
