/**
 * Entity Tags Hook
 * 管理实体标签的状态和逻辑
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { EntityTag, EntityTagMessage } from './types'

type UseEntityTagsOptions = {
  // 当新标签被添加时的回调，返回新标签的文本表示（用于插入输入框）
  onTagsAdded?: (tagsText: string) => void;
}

export const useEntityTags = (options: UseEntityTagsOptions = {}) => {
  const [entityTags, setEntityTags] = useState<EntityTag[]>([])
  const onTagsAddedRef = useRef(options.onTagsAdded)

  // 保持 ref 同步
  useEffect(() => {
    onTagsAddedRef.current = options.onTagsAdded
  }, [options.onTagsAdded])

  // 生成唯一ID
  const generateId = () =>
    `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // 将单个标签转换为输入框显示文本格式 [label]
  const tagToInputText = useCallback((tag: Omit<EntityTag, 'id'>) => {
    const displayText = tag.label || tag.value
    return `[${displayText}]`
  }, [])

  // 添加标签
  const addTags = useCallback(
    (tags: Array<Omit<EntityTag, 'id'>>) => {
      const newTags = tags.map(tag => ({
        ...tag,
        id: generateId(),
      }))
      setEntityTags(prev => [...prev, ...newTags])

      // 通知外部组件插入标签文本到输入框
      if (onTagsAddedRef.current) {
        const tagsText = tags.map(tagToInputText).join(' ')
        onTagsAddedRef.current(tagsText)
      }
    },
    [tagToInputText],
  )

  // 删除标签
  const removeTag = useCallback((id: string) => {
    setEntityTags(prev => prev.filter(tag => tag.id !== id))
  }, [])

  // 清空所有标签
  const clearTags = useCallback(() => {
    setEntityTags([])
  }, [])

  // 将标签转换为 Markdown 链接格式文本（用于发送给大模型）
  const tagsToText = useCallback((tags: EntityTag[]) => {
    return tags
      .map((tag) => {
        const displayText = tag.label || tag.value
        return `[${displayText}](${tag.value})`
      })
      .join(' ')
  }, [])

  // 监听 postMessage 事件
  useEffect(() => {
    const handleMessage = (event: MessageEvent<EntityTagMessage>) => {
      if (event.data?.type === 'dify-add-entity-tags') {
        const { tags } = event.data.payload
        if (Array.isArray(tags) && tags.length > 0) addTags(tags)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [addTags])

  return {
    entityTags,
    addTags,
    removeTag,
    clearTags,
    tagsToText,
    tagToInputText,
  }
}
