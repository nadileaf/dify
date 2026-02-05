import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const ThinkingIndicator = () => {
  const { t } = useTranslation()
  const indicators = t('common.chat.thinkingIndicators', { returnObjects: true }) as string[]
  const [currentIndex, setCurrentIndex] = useState(Math.floor(Math.random() * indicators.length))
  const [displayChars, setDisplayChars] = useState<string[]>([])
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    const currentText = `${indicators[currentIndex]}`

    if (displayChars.length === 0) {
      setDisplayChars(currentText.split(''))
      return
    }

    if (!isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(true)
        setCharIndex(0)
      }, 3000)
      return () => clearTimeout(timer)
    }

    if (isTransitioning) {
      const nextText = `${indicators[(currentIndex + 1) % indicators.length]}`
      const nextChars = nextText.split('')
      const maxLength = Math.max(displayChars.length, nextChars.length)

      if (charIndex < maxLength) {
        const timer = setTimeout(() => {
          setDisplayChars((prev) => {
            const newChars = [...prev]
            if (charIndex < nextChars.length)
              newChars[charIndex] = nextChars[charIndex]
            else if (charIndex < newChars.length)
              newChars.splice(charIndex, 1)

            return newChars
          })
          setCharIndex(charIndex + 1)
        }, 50)
        return () => clearTimeout(timer)
      }
      else {
        setDisplayChars(nextChars)
        setCurrentIndex((currentIndex + 1) % indicators.length)
        setIsTransitioning(false)
        setCharIndex(0)
      }
    }
  }, [currentIndex, indicators, displayChars.length, isTransitioning, charIndex])

  return (
    <div className="mt-3 flex items-center text-text-tertiary">
      <span className="system-xs-regular">
        {displayChars.map((char, idx) => (
          <span
            key={idx}
            className={`inline-block transition-all duration-100 ${
              isTransitioning && idx === charIndex - 1 ? 'animate-fade-in' : ''
            }`}
          >
            {char}
          </span>
        ))}
        <span className="ml-1 animate-pulse ">...</span>
      </span>
    </div>
  )
}

export default ThinkingIndicator
