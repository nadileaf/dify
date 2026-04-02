import { useCallback, useEffect, useState } from 'react'

type UseTypewriterOptions = {
  texts: string[]
  typingSpeed?: number
  pauseDuration?: number
  loop?: boolean
}

export const useTypewriter = ({
  texts,
  typingSpeed = 100,
  pauseDuration = 2000,
  loop = true,
}: UseTypewriterOptions) => {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isActive, setIsActive] = useState(false)

  const startTypewriter = useCallback(() => {
    if (texts.length === 0)
      return
    setIsActive(true)
  }, [texts.length])

  const stopTypewriter = useCallback(() => {
    setIsActive(false)
    setDisplayText('')
    setCurrentIndex(0)
  }, [])

  useEffect(() => {
    if (!isActive || texts.length === 0)
      return

    const currentText = texts[currentIndex].replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
    let timeout: NodeJS.Timeout

    if (displayText.length < currentText.length) {
      timeout = setTimeout(() => {
        setDisplayText(currentText.slice(0, displayText.length + 1))
      }, typingSpeed)
    }
    else {
      timeout = setTimeout(() => {
        setDisplayText('')
        if (loop)
          setCurrentIndex(prevIndex => (prevIndex + 1) % texts.length)
        else if (currentIndex < texts.length - 1)
          setCurrentIndex(currentIndex + 1)
        else
          setIsActive(false)
      }, pauseDuration)
    }

    return () => {
      if (timeout)
        clearTimeout(timeout)
    }
  }, [displayText, currentIndex, texts, typingSpeed, pauseDuration, loop, isActive])

  return {
    displayText,
    isActive,
    startTypewriter,
    stopTypewriter,
  }
}
