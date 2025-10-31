import React, { memo } from 'react'
import { View, Text } from 'react-native'
import FlowerGauge from '../FlowerGauge'
import { calcStageProgress } from './stageUtil'
import FlowerStageLottie from './FlowerStageLottie' // ← 정적 import로 교체

type Props = {
  pt: number
  hideLabels?: boolean
}

/** calcStageProgress 실패 대비 폴백 */
function fallbackStage(p: number) {
  if (p >= 100) return { level: 5, label: '개화(활짝핀꽃)' }
  if (p >= 70) return { level: 4, label: '봉오리/반쯤열림' }
  if (p >= 50) return { level: 3, label: '꽃봉오리' }
  if (p >= 30) return { level: 2, label: '줄기' }
  if (p >= 10) return { level: 1, label: '새싹' }
  return { level: 0, label: '씨앗' }
}

/** Lottie 쪽 렌더 에러만 흡수하는 미니 바운더리 */
class LottieBoundary extends React.Component<
  { fallback?: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(err: any) {
    console.log('[FlowerStageLottie error]', err)
  }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null
    return this.props.children
  }
}

function Component({ pt = 0, hideLabels = false }: Props) {
  const p = Number.isFinite(+pt) ? Math.max(0, Math.min(100, +pt)) : 0

  let stage: any
  try {
    stage = calcStageProgress?.(p)
  } catch {}
  const safeStage = stage ?? fallbackStage(p)

  return (
    <View style={{ alignItems: 'center' }}>
      {/* 1) 기준 게이지: 항상 중앙 표시 (내부 라벨은 숨김) */}
      <FlowerGauge pt={p} hideLabels />

      {/* 2) 단계 Lottie (문제나면 조용히 스킵) */}
      <View style={{ marginTop: 8 }}>
        <LottieBoundary>
          <FlowerStageLottie stage={safeStage} size={220} />
        </LottieBoundary>
      </View>

      {/* 3) 텍스트 라벨(옵션) */}
      {!hideLabels && (
        <View style={{ alignItems: 'center', marginTop: 6 }}>
          <Text style={{ fontWeight: '800' }}>{safeStage.label}</Text>
          <Text style={{ color: '#888' }}>{Math.round(p)}pt</Text>
        </View>
      )}
    </View>
  )
}

export default memo(Component)
