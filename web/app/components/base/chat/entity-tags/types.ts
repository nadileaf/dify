/**
 * Entity Tag Types
 * 实体标签类型定义
 */

export type EntityTag = {
  id: string // 唯一标识
  icon?: string // 可选图标（emoji 或图片 URL，支持 http/https/data:image）
  label?: string // 可选显示文本
  value: string // 必需，实际发送给大模型的值
}

export type EntityTagMessage = {
  type: 'dify-add-entity-tags'
  payload: {
    tags: Array<Omit<EntityTag, 'id'>> // 外部传入不需要 id
  }
}
