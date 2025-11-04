import React from 'react'
import { Platform, View } from 'react-native'
import type { StageDef } from './stageConfig'

type Props = { stage: StageDef; size?: number; autoplay?: boolean; loop?: boolean }

export default function FlowerStageLottie({ stage, size = 220, autoplay = true, loop }: Props) {
  const lp = typeof loop === 'boolean' ? loop : !!stage.loop

  if (Platform.OS === 'web') {
    // 웹: lottie-react
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Lottie = require('lottie-react').default
    return (
      <View style={{ width: size, height: size, alignSelf: 'center' }}>
        <Lottie
          animationData={stage.lottie}
          autoplay={autoplay}
          loop={lp}
          style={{ width: size, height: size }}
        />
      </View>
    )
  }

  // 네이티브: lottie-react-native
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const LottieView = require('lottie-react-native')
  return (
    <LottieView
      source={stage.lottie}
      autoPlay={autoplay}
      loop={lp}
      style={{ width: size, height: size, alignSelf: 'center' }}
    />
  )
}
