import React from 'react'
import { Platform, View, Image } from 'react-native'
import type { StageDef } from './stageConfig'

// 네이티브에서만 Lottie 사용 (웹은 PNG 폴백)
let LottieView: any = null
if (Platform.OS !== 'web') {
  // 설치되어 있다면 정상 import, 없으면 try/catch로 안전하게
  try {
    LottieView = require('lottie-react-native').default
  } catch (e) {
    LottieView = null
  }
}

type Props = {
  stage: StageDef | { label: string } // 안전타입
  size?: number
}

export default function FlowerStageLottie({ stage, size = 220 }: Props) {
  // 웹: PNG 폴백 (또는 네이티브 Lottie 미설치 시에도 PNG 사용)
  if (Platform.OS === 'web' || !LottieView) {
    // stage가 StageDef가 아닐 경우를 대비해 png 존재 여부 체크
    const pngSrc = (stage as any).png
    if (pngSrc) {
      return (
        <Image
          source={pngSrc}
          style={{ width: size, height: size, objectFit: 'contain' as any }}
          resizeMode="contain"
        />
      )
    }
    // PNG도 없으면 빈 영역
    return <View style={{ width: size, height: size }} />
  }

  // 네이티브: Lottie 애니메이션
  return (
    <View style={{ width: size, height: size }}>
      <LottieView
        source={(stage as any).lottie}
        autoPlay
        loop={(stage as any).loop ?? true}
        style={{ width: size, height: size }}
      />
    </View>
  )
}
