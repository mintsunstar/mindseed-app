// components/profile/ProfileModals/FlowerDetailModal.tsx
import React from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import type { Bloom } from '@/store/useApp'

type Props = {
  visible: boolean
  flower: Bloom | null
  onClose: () => void
}

export default function FlowerDetailModal({ visible, flower, onClose }: Props) {
  if (!flower) return null

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.dim}>
        <View style={s.box}>
          <View style={s.header}>
            <Text style={s.title}>감정꽃 상세</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={s.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={s.content}>
            <Text style={s.emoji}>{flower.emoji ?? '🌸'}</Text>
            <Text style={s.name}>{flower.name}</Text>
            <Text style={s.meta}>
              {flower.date} · {flower.tagEmotion} · {flower.likes}💧
            </Text>

            {flower.note && (
              <View style={s.noteBox}>
                <Text style={s.noteLabel}>당시 기록 메모</Text>
                <Text style={s.noteText}>{flower.note}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  dim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 16, fontWeight: '800', color: '#111827' },
  close: { fontSize: 18 },
  content: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  meta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  noteBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: '100%',
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4b5563',
    marginBottom: 6,
  },
  noteText: {
    fontSize: 13,
    color: '#111827',
  },
})
