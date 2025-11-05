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

// components/Flower/FlowerGrowth.tsx
import React, { memo, useMemo } from 'react'
import { View, Text, Image } from 'react-native'
import FlowerGauge from '../FlowerGauge'

type Props = { pt: number; hideLabels?: boolean }

/** pt → 단계 id (stageUtil에 의존하지 않고 여기서 결정) */
function stageIdByPt(p: number) {
  if (p >= 100) return 'bloom'
  if (p >= 70) return 'half'
  if (p >= 50) return 'bud'
  if (p >= 30) return 'stem'
  if (p >= 10) return 'sprout'
  return 'seed'
}

/** 단계 라벨 */
function stageLabelById(id: string) {
  switch (id) {
    case 'seed':
      return '씨앗'
    case 'sprout':
      return '새싹'
    case 'stem':
      return '줄기'
    case 'bud':
      return '꽃봉오리'
    case 'half':
      return '반쯤핀꽃'
    case 'bloom':
      return '개화(활짝핀꽃)'
    default:
      return '씨앗'
  }
}

/** 단계별 이미지 require (경로 틀리면 바로 확인 가능) */
function stageImageRequire(id: string) {
  try {
    switch (id) {
      case 'seed':
        return require('@/assets/images/stages/seed.png')
      case 'sprout':
        return require('@/assets/images/stages/sprout.png')
      case 'stem':
        return require('@/assets/images/stages/stem.png')
      case 'bud':
        return require('@/assets/images/stages/bud.png')
      case 'half':
        return require('@/assets/images/stages/half.png')
      case 'bloom':
        return require('@/assets/images/stages/bloom.png')
      default:
        return require('@/assets/images/stages/seed.png')
    }
  } catch (e) {
    console.log('[FlowerGrowth] image require failed for id=', id, e)
    return undefined
  }
}

function Component({ pt = 0, hideLabels = false }: Props) {
  const p = Number.isFinite(+pt) ? Math.max(0, Math.min(100, +pt)) : 0

  const { id, label, img } = useMemo(() => {
    const sid = stageIdByPt(p)
    const src = stageImageRequire(sid)
    return { id: sid, label: stageLabelById(sid), img: src }
  }, [p])

  return (
    <View style={{ alignItems: 'center' }}>
      {/* 1) 기준 게이지 (가운데 라벨은 숨김) */}
      <View style={{ width: 220, height: 220, alignItems: 'center', justifyContent: 'center' }}>
        <FlowerGauge pt={p} hideLabels />
        {/* 2) 단계 이미지: 게이지 중앙에 겹쳐서 표시 (로딩 실패시 스킵) */}
        {img && (
          <Image
            source={img}
            // pointerEvents는 Image에 넣지 말 것 (TS 에러 유발). 필요하면 View로 감싸서 pointerEvents="none" 사용
            style={{
              position: 'absolute',
              width: 140,
              height: 140,
              resizeMode: 'contain',
            }}
          />
        )}
      </View>

      {/* 3) 텍스트 라벨/퍼센트 (옵션) */}
      {!hideLabels && (
        <View style={{ alignItems: 'center', marginTop: 6 }}>
          <Text style={{ fontWeight: '800' }}>{label}</Text>
          <Text style={{ color: '#888' }}>{Math.round(p)}%</Text>
        </View>
      )}
    </View>
  )
}

export default memo(Component)
