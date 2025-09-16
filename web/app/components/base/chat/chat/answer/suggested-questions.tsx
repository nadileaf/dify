import type { FC } from 'react'
import { memo } from 'react'
import type { ChatItem } from '../../types'
import { useChatContext } from '../context'
import { Button } from '@heroui/react'

type SuggestedQuestionsProps = {
  item: ChatItem
}
const SuggestedQuestions: FC<SuggestedQuestionsProps> = ({
  item,
}) => {
  const { onSend } = useChatContext()

  const {
    isOpeningStatement,
    suggestedQuestions,
  } = item

  if (!isOpeningStatement || !suggestedQuestions?.length)
    return null

  return (
    <div className='mt-2 flex flex-wrap gap-2'>
      {suggestedQuestions.filter(q => !!q && q.trim()).map((question, index) => (
        <Button key={index} variant='flat' size='sm' onPress={() => onSend?.(question)}>
          {question}
        </Button>
      ))}

    </div>
  )
}

export default memo(SuggestedQuestions)
