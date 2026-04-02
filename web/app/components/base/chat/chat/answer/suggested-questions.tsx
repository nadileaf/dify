import type { FC } from 'react'
import type { ChatItem } from '../../types'
import { memo } from 'react'
import { cn } from '@/utils/classnames'
import { useChatContext } from '../context'
import {Button} from '@heroui/react'

type SuggestedQuestionsProps = {
  item: ChatItem
  isWelcome?: boolean
}
const SuggestedQuestions: FC<SuggestedQuestionsProps> = ({
  item,
}) => {
  const { onSend, readonly } = useChatContext()

  const {
    isOpeningStatement,
    suggestedQuestions,
  } = item

  if (!isOpeningStatement || !suggestedQuestions?.length)
    return null

  return (
    <div className="flex flex-wrap">
      {suggestedQuestions.filter(q => !!q && q.trim()).map((question, index) => (
        <Button
          key={index}
          className={cn(
            readonly && 'pointer-events-none opacity-50',
          )}
          onClick={() => !readonly && onSend?.(question)}
          data-testid="suggested-question"
          variant='shadow'
          radius='full'
        >
          {question}
        </Button>
      ),
      )}
    </div>
  )
}

export default memo(SuggestedQuestions)
