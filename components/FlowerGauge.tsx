// components/FlowerGauge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Gauge from '@/components/Gauge';

function flowerEmoji(pct: number) {
  if (pct >= 100) return '🌺';
  if (pct >= 75) return '🌸';
  if (pct >= 50) return '🌼';
  if (pct >= 25) return '🌿';
  return '🌱';
}

export default function FlowerGauge({
  pct,
  hideLabels = false,
}: {
  pct: number;
  hideLabels?: boolean;
}) {
  return (
    <View style={s.wrap}>
      {/* 게이지 자체 */}
      <Gauge pct={pct} />

      {/* 중앙 라벨 (옵션) */}
      {!hideLabels && (
        <View style={s.center}>
          <Text style={s.emoji}>{flowerEmoji(pct)}</Text>
          <Text style={s.pct}>{Math.round(pct)}%</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: 220, height: 220, alignSelf: 'center' },
  center: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  emoji: { fontSize: 40 },
  pct: { fontWeight: '800', color: '#333' },
});
