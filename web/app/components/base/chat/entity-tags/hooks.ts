/**
 * Entity Tags Hook
 * 管理实体标签的状态和逻辑
 */

import { useCallback, useEffect, useState } from 'react'
import type { EntityTag, EntityTagMessage } from './types'

export const useEntityTags = () => {
  const [entityTags, setEntityTags] = useState<EntityTag[]>([])

  // 生成唯一ID
  const generateId = () => `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // 添加标签
  const addTags = useCallback((tags: Array<Omit<EntityTag, 'id'>>) => {
    const newTags = tags.map(tag => ({
      ...tag,
      id: generateId(),
    }))
    setEntityTags(prev => [...prev, ...newTags])
  }, [])

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
    return tags.map((tag) => {
      const displayText = tag.label || tag.value
      return `[${displayText}](${tag.value})`
    }).join(' ')
  }, [])

  // 监听 postMessage 事件
  useEffect(() => {
    const handleMessage = (event: MessageEvent<EntityTagMessage>) => {
      if (event.data?.type === 'dify-add-entity-tags') {
        const { tags } = event.data.payload
        if (Array.isArray(tags) && tags.length > 0)
          addTags(tags)
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
  }
}
