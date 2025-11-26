import type { FC } from 'react'
import { memo } from 'react'
import type { ChatItem } from '../../types'
import { useChatContext } from '../context'
import { Button } from '@heroui/react'

type SuggestedQuestionsProps = {
  item: ChatItem
  isWelcome?: boolean
}
const SuggestedQuestions: FC<SuggestedQuestionsProps> = ({
  item,
  isWelcome,
}) => {
  const { onSend } = useChatContext()

  const {
    isOpeningStatement,
    suggestedQuestions,
  } = item

  if (!isOpeningStatement || !suggestedQuestions?.length)
    return null

  return (
    <div className='mt-2 flex flex-wrap gap-3 max-sm:gap-2'>
      {suggestedQuestions.filter(q => !!q && q.trim()).map((question, index) => (
        <Button key={index} variant={isWelcome ? 'shadow' : 'flat'} size={isWelcome ? 'md' : 'sm'} onPress={() => onSend?.(question)} radius={isWelcome ? 'full' : 'md'} className={isWelcome ? 'border-default-200 bg-default-50 text-foreground-700 max-sm:p-2 max-sm:text-xs' : ''}>
          {question}
        </Button>
      ))}

    </div>
  )
}

export default memo(SuggestedQuestions)
