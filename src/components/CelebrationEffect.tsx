import { useEffect, useState } from 'react'

interface CelebrationEffectProps {
  onComplete: () => void
}

export function CelebrationEffect({ onComplete }: CelebrationEffectProps) {
  const [confetti, setConfetti] = useState<
    Array<{
      id: number
      color: string
      left: string
      top: string
      delay: string
      size: number
    }>
  >([])

  // 紙吹雪の色
  const colors = [
    'bg-red-500',
    'bg-red-400',
    'bg-blue-500',
    'bg-blue-400',
    'bg-green-500',
    'bg-green-400',
    'bg-yellow-500',
    'bg-yellow-400',
    'bg-purple-500',
    'bg-purple-400',
    'bg-pink-500',
    'bg-pink-400',
    'bg-orange-500',
    'bg-orange-400',
    'bg-indigo-500',
    'bg-indigo-400',
    'bg-teal-500',
    'bg-teal-400',
  ]

  useEffect(() => {
    // 紙吹雪を生成
    const confettiCount = 100
    const newConfetti = Array.from({ length: confettiCount }).map(
      (_, index) => {
        const color = colors[Math.floor(Math.random() * colors.length)]
        // 画面全体にランダムに配置
        const left = `${Math.random() * 100}%`
        const top = `${Math.random() * 100}%`
        const delay = `${Math.random() * 0.5}s`
        // ランダムなサイズ (5px〜8px)
        const size = 5 + Math.random() * 3
        return { id: index, color, left, top, delay, size }
      },
    )

    setConfetti(newConfetti)

    // アニメーション終了後にコンポーネントを非表示にする
    const timer = setTimeout(() => {
      onComplete()
    }, 4000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* 紙吹雪 */}
      {confetti.map((item) => (
        <div
          key={item.id}
          className={`absolute ${item.color} animate-confetti`}
          style={{
            left: item.left,
            top: item.top,
            width: `${item.size}px`,
            height: `${item.size}px`,
            animationDelay: item.delay,
            transform: 'rotate(45deg)',
          }}
        />
      ))}
    </div>
  )
}
