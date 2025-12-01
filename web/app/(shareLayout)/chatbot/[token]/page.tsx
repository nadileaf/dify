'use client'
import React, { useEffect } from 'react'
import EmbeddedChatbotWithQueryParams from '@/app/components/base/chat/embedded-chatbot/with-query-params'
import AuthenticatedLayout from '../../components/authenticated-layout'
import { initLinkClickInterceptor } from '@/app/components/base/chat/embedded-chatbot/link-click-interceptor'

const Chatbot = () => {
  useEffect(() => {
    const cleanup = initLinkClickInterceptor({
      targetOrigin: '*',
      debug: true,
    })

    return cleanup
  }, [])

  return (
    <AuthenticatedLayout>
      <EmbeddedChatbotWithQueryParams />
    </AuthenticatedLayout>
  )
}

export default React.memo(Chatbot)
