'use client'
import React from 'react'
import EmbeddedChatbotWithQueryParams from '@/app/components/base/chat/embedded-chatbot/with-query-params'
import AuthenticatedLayout from '../../components/authenticated-layout'

const Chatbot = () => {
  return (
    <AuthenticatedLayout>
      <EmbeddedChatbotWithQueryParams />
    </AuthenticatedLayout>
  )
}

export default React.memo(Chatbot)
