import { useCallback, useEffect, useState } from 'react'

type UseTypewriterOptions = {
  texts: string[]
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
  loop?: boolean
}

export const useTypewriter = ({
  texts,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  loop = true,
}: UseTypewriterOptions) => {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isActive, setIsActive] = useState(false)

  const startTypewriter = useCallback(() => {
    if (texts.length === 0) return
    setIsActive(true)
  }, [texts.length])

  const stopTypewriter = useCallback(() => {
    setIsActive(false)
    setDisplayText('')
    setCurrentIndex(0)
    setIsDeleting(false)
  }, [])

  useEffect(() => {
    if (!isActive || texts.length === 0) return

    const currentText = texts[currentIndex].replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
    let timeout: NodeJS.Timeout

    if (!isDeleting) {
      // 正在输入
      if (displayText.length < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1))
        }, typingSpeed)
      }
 else {
        // 输入完成，暂停后开始删除
        timeout = setTimeout(() => {
          setIsDeleting(true)
        }, pauseDuration)
      }
    }
 else {
      // 正在删除
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1))
        }, deletingSpeed)
      }
 else {
        // 删除完成，切换到下一个文本
        setIsDeleting(false)
        if (loop)
          setCurrentIndex(prevIndex => (prevIndex + 1) % texts.length)
         else if (currentIndex < texts.length - 1)
          setCurrentIndex(currentIndex + 1)
         else
          setIsActive(false)
      }
    }

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [displayText, currentIndex, isDeleting, texts, typingSpeed, deletingSpeed, pauseDuration, loop, isActive])

  return {
    displayText,
    isActive,
    startTypewriter,
    stopTypewriter,
  }
}
