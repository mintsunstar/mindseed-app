// components/Gauge.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg'

type Props = {
  pt?: number // 0~100
  conditionsMet?: boolean
  /** 기본 false: 게이지만 그리기. true면 중앙 라벨(stage/pt)도 표시 */
  showLabels?: boolean
  size?: number // 게이지 외경 (기본 120)
  stroke?: number // 선 두께 (기본 12)
}

function stageLabelFromPt(p: number, met: boolean) {
  // UX Flow 기준: 0:씨앗 / 10~29:새싹 / 30~49:줄기 / 50~69:꽃봉오리 / 70~99:개화직전 / 100:개화(조건 충족 시)
  if (p >= 100) return met ? '개화(활짝핀꽃)' : '개화직전'
  if (p >= 70) return '개화직전'
  if (p >= 50) return '꽃봉오리'
  if (p >= 30) return '줄기'
  if (p >= 10) return '새싹'
  return '씨앗'
}

export default function Gauge({
  pt = 0,
  conditionsMet = false,
  showLabels = false,
  size = 120,
  stroke = 12,
}: Props) {
  const safe = Number.isFinite(+pt) ? Math.max(0, Math.min(100, +pt)) : 0

  const cx = size / 2
  const cy = size / 2
  const r = cx - stroke
  const c = 2 * Math.PI * r
  const offset = c * (1 - safe / 100)

  const label = stageLabelFromPt(safe, conditionsMet)

  return (
    <View style={[s.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <LinearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#7fb3ff" />
            <Stop offset="100%" stopColor="#6ab59b" />
          </LinearGradient>
        </Defs>

        {/* 배경 원 */}
        <Circle cx={cx} cy={cy} r={r} stroke="#eee" strokeWidth={stroke} fill="none" />

        {/* 진행 원 */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="url(#gaugeGrad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </Svg>

      {showLabels && (
        <View style={s.center}>
          <Text style={s.stage}>{label}</Text>
          <Text style={s.pt}>{Math.round(safe)}pt</Text>
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stage: { fontWeight: '800' },
  pt: { fontWeight: '900', fontSize: 16, marginTop: 2 },
})
