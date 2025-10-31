import React, { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import type { StageDef } from './stageConfig'

type Props = {
  stage: StageDef
  size?: number
  autoplay?: boolean
}

/**
 * 웹 ↔ 네이티브 Lottie 프롭 차이를 안전하게 흡수
 * - web:  lottie-react     → animationData
 * - native: lottie-react-native → source
 */
export default function FlowerStageLottie({ stage, size = 220, autoplay = true }: Props) {
  const [Lottie, setLottie] = useState<any>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        if (Platform.OS === 'web') {
          const mod = await import('lottie-react')
          if (alive) setLottie(() => mod.default)
        } else {
          const mod = await import('lottie-react-native')
          if (alive) setLottie(() => mod.default)
        }
      } catch (e) {
        console.warn('[Lottie import error]', e)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  if (!Lottie) return null

  const loop = stage.loop ?? true

  if (Platform.OS === 'web') {
    // lottie-react
    return (
      <Lottie
        animationData={stage.lottie}
        loop={loop}
        autoPlay={autoplay}
        style={{ width: size, height: size, alignSelf: 'center' }}
      />
    )
  }
  // lottie-react-native
  return (
    <Lottie
      source={stage.lottie}
      loop={loop}
      autoPlay={autoplay}
      style={{ width: size, height: size, alignSelf: 'center' }}
    />
  )
}
