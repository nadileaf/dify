/**
 * Entity Tag Item Component
 * 单个实体标签组件
 */

import type { FC } from 'react'
import { RiCloseLine } from '@remixicon/react'
import type { EntityTag } from './types'
import { cn } from '@/utils/classnames'

type EntityTagItemProps = {
  tag: EntityTag
  onRemove: (id: string) => void
  size?: 'sm' | 'md'
}

const isImageUrl = (str: string): boolean => {
  return /^(https?:\/\/|data:image\/)/.test(str)
}

export const EntityTagItem: FC<EntityTagItemProps> = ({
  tag,
  onRemove,
  size = 'sm',
}) => {
  const sizeClasses = {
    sm: 'gap-0.5 px-1.5 py-0.5 text-xs',
    md: 'gap-1 px-2 py-1 text-sm',
  }

  const iconSizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
  }

  const renderIcon = () => {
    if (!tag.icon)
      return null

    if (isImageUrl(tag.icon)) {
      return (
        <img
          src={tag.icon}
          alt=""
          className={cn('rounded object-cover', iconSizeClasses[size])}
        />
      )
    }

    return <span className="text-xs leading-none">{tag.icon}</span>
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-divider-deep',
        'bg-components-badge-white-to-dark text-text-secondary',
        'shadow-xs transition-all hover:shadow-sm',
        'font-medium',
        sizeClasses[size],
      )}
    >
      {renderIcon()}
      <span className="max-w-[200px] truncate">{tag.label || tag.value}</span>
      <button
        type="button"
        onClick={() => onRemove(tag.id)}
        className="ml-0.5 flex h-4 w-4 items-center justify-center rounded transition-colors hover:bg-state-base-hover"
        title="删除标签"
      >
        <RiCloseLine className="h-3.5 w-3.5 text-text-tertiary hover:text-text-secondary" />
      </button>
    </span>
  )
}
