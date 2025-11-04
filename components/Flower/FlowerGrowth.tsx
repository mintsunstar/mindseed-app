// import React, { memo } from 'react'
// import { View, Text } from 'react-native'
// import FlowerGauge from '../FlowerGauge'
// import { calcStageProgress } from './stageUtil'
// import FlowerStageLottie from './FlowerStageLottie'

// type Props = {
//   pt: number
//   hideLabels?: boolean
// }

// const SIZE = 220

// /** calcStageProgress 실패 대비 폴백 */
// function fallbackStage(p: number) {
//   if (p >= 100) return { level: 5, label: '개화(활짝핀꽃)' }
//   if (p >= 70) return { level: 4, label: '봉오리/반쯤열림' }
//   if (p >= 50) return { level: 3, label: '꽃봉오리' }
//   if (p >= 30) return { level: 2, label: '줄기' }
//   if (p >= 10) return { level: 1, label: '새싹' }
//   return { level: 0, label: '씨앗' }
// }

// /** Lottie 렌더 에러만 흡수하는 미니 바운더리 */
// class LottieBoundary extends React.Component<
//   { fallback?: React.ReactNode; children: React.ReactNode },
//   { hasError: boolean }
// > {
//   constructor(props: any) {
//     super(props)
//     this.state = { hasError: false }
//   }
//   static getDerivedStateFromError() {
//     return { hasError: true }
//   }
//   componentDidCatch(err: any) {
//     console.log('[FlowerStageLottie error]', err)
//   }
//   render() {
//     if (this.state.hasError) return this.props.fallback ?? null
//     return this.props.children
//   }
// }

// function Component({ pt = 0, hideLabels = false }: Props) {
//   // 0~100 정규화
//   const p = Number.isFinite(+pt) ? Math.max(0, Math.min(100, +pt)) : 0

//   // 안전 단계 계산
//   let stage: any
//   try {
//     stage = calcStageProgress?.(p)
//   } catch {}
//   const safeStage = stage ?? fallbackStage(p)

//   return (
//     <View style={{ alignItems: 'center' }}>
//       {/* 1) 기준 원형 게이지 (내부 라벨 숨김) */}
//       <FlowerGauge pt={p} hideLabels />

//       {/* 2) 단계 Lottie (문제 나면 조용히 스킵) */}
//       <View
//         style={{
//           marginTop: 8,
//           width: SIZE,
//           height: safeStage ? SIZE : 0, // 단계 없을 때 높이 제거 → 빈공간 방지
//           alignItems: 'center',
//           justifyContent: 'center',
//           overflow: 'hidden',
//         }}
//       >
//         <LottieBoundary>
//           <FlowerStageLottie stage={safeStage} size={SIZE} />
//         </LottieBoundary>
//       </View>

//       {/* 3) 텍스트 라벨(옵션) */}
//       {!hideLabels && (
//         <View style={{ alignItems: 'center', marginTop: 6 }}>
//           <Text style={{ fontWeight: '800' }}>{safeStage.label} 단계</Text>
//           <Text style={{ color: '#888' }}>{Math.round(p)}%</Text>
//         </View>
//       )}
//     </View>
//   )
// }

// export default memo(Component)

import React, { memo } from 'react'
import { View, Text } from 'react-native'
import FlowerGauge from '../FlowerGauge'
import { calcStageProgress } from './stageUtil'

type Props = { pt: number; hideLabels?: boolean }

function fallbackStage(p: number) {
  if (p >= 100) return { level: 5, label: '개화(활짝핀꽃)' }
  if (p >= 70) return { level: 4, label: '봉오리/반쯤열림' }
  if (p >= 50) return { level: 3, label: '꽃봉오리' }
  if (p >= 30) return { level: 2, label: '줄기' }
  if (p >= 10) return { level: 1, label: '새싹' }
  return { level: 0, label: '씨앗' }
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
      {/* ▶ LOTTIE 임시 비활성: 게이지만 */}
      <FlowerGauge pt={p} hideLabels />

      {!hideLabels && (
        <View style={{ alignItems: 'center', marginTop: 6 }}>
          <Text style={{ fontWeight: '800' }}>{safeStage.label}</Text>
          <Text style={{ color: '#888' }}>{Math.round(p)}%</Text>
        </View>
      )}
    </View>
  )
}

export default memo(Component)
