/**
 * Entity Tags Container
 * 实体标签容器组件
 */

import type { FC } from 'react'
import type { EntityTag } from './types'
import { EntityTagItem } from './entity-tag-item'

type EntityTagsProps = {
  tags: EntityTag[]
  onRemoveTag: (id: string) => void
  size?: 'sm' | 'md'
}

export const EntityTags: FC<EntityTagsProps> = ({
  tags,
  onRemoveTag,
  size = 'sm',
}) => {
  if (tags.length === 0)
    return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-t-xl border-b border-divider-subtle bg-components-panel-bg-blur px-3 py-2.5">
      {tags.map(tag => (
        <EntityTagItem
          key={tag.id}
          tag={tag}
          onRemove={onRemoveTag}
          size={size}
        />
      ))}
    </div>
  )
}

export { EntityTagItem } from './entity-tag-item'
export * from './hooks'
export * from './types'
