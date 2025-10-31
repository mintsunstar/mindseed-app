import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Gauge from '@/components/Gauge'

type Props = {
  pt?: number
  hideLabels?: boolean
  conditionsMet?: boolean
}

/**
 * 🌿 감정 성장 단계에 따른 대표 이모지
 * (개화 전까지는 이모지 변화로만 표현)
 */
function flowerEmoji(pt: number, conditionsMet: boolean) {
  const p = Math.max(0, Math.min(100, pt))
  if (p === 100 && conditionsMet) return '🌺' // 완전 개화
  if (p >= 90) return '🌸' // 반쯤 핀꽃
  if (p >= 70) return '🌼' // 봉오리
  if (p >= 50) return '🌿' // 줄기
  if (p >= 30) return '🌱' // 새싹
  return '🪴' // 씨앗
}

export default function FlowerGauge({ pt = 0, hideLabels = false, conditionsMet = false }: Props) {
  const value = Number.isFinite(Number(pt)) ? Number(pt) : 0
  const emoji = flowerEmoji(value, conditionsMet)

  return (
    <View style={s.wrap}>
      {/* 기본 게이지 시각화 */}
      <Gauge pt={value} conditionsMet={conditionsMet} />

      {/* 중앙 텍스트 / 이모지 표시 */}
      {!hideLabels && (
        <View style={s.center}>
          <Text style={s.emoji}>{emoji}</Text>
          <Text style={s.ptLabel}>{Math.round(value)}pt</Text>
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  wrap: {
    width: 220,
    height: 220,
    alignSelf: 'center',
    position: 'relative',
  },
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  emoji: { fontSize: 42 },
  ptLabel: { fontWeight: '800', color: '#333', fontSize: 14 },
})
