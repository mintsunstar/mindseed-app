import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import type { ProfileStats } from './ProfileTypes'

type Props = {
  stats: ProfileStats
  onPressExport?: () => void
  onPressAlbum?: () => void
}

export function ProfileStatsSection({ stats, onPressExport, onPressAlbum }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.statsRow}>
        <Stat label="감정 기록" value={stats.totalRecords} />
        <Stat label="받은 공감" value={stats.totalLikes} />
        <Stat label="피운 꽃" value={stats.totalBlooms} />
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onPressAlbum}>
          <Text style={styles.actionTitle}>감정꽃 앨범</Text>
          <Text style={styles.actionDesc}>피운 감정꽃 모아보기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onPressExport}>
          <Text style={styles.actionTitle}>기록 내보내기</Text>
          <Text style={styles.actionDesc}>CSV · JSON 저장</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statValue: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#8A94A6' },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F6F8FB',
  },
  actionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  actionDesc: { fontSize: 11, color: '#8A94A6' },
})
