// components/profile/ProfileModals/AlbumModal.tsx
import React from 'react'
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native'
import type { Bloom } from '@/store/useApp' // 이미 타입 정의돼있으면 사용

type Props = {
  visible: boolean
  blooms: Bloom[]
  onSelect: (flower: Bloom) => void
  onClose: () => void
}

export default function AlbumModal({ visible, blooms, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.dim}>
        <View style={s.sheet}>
          <View style={s.header}>
            <Text style={s.title}>감정꽃 앨범</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={s.close}>✕</Text>
            </TouchableOpacity>
          </View>

          {blooms.length === 0 ? (
            <View style={s.emptyWrap}>
              <Text style={s.emptyText}>아직 개화한 감정꽃이 없어요.</Text>
              <Text style={s.emptySub}>기록을 쌓으면 여기서 감정꽃을 모아볼 수 있어요.</Text>
            </View>
          ) : (
            <FlatList
              data={blooms}
              numColumns={2}
              keyExtractor={(item) => item.id}
              contentContainerStyle={s.list}
              columnWrapperStyle={{ gap: 10 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.card} onPress={() => onSelect(item)} activeOpacity={0.8}>
                  <Text style={s.emoji}>{item.emoji ?? '🌸'}</Text>
                  <Text style={s.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={s.meta} numberOfLines={1}>
                    {item.tagEmotion} · {item.likes}💧
                  </Text>
                  <Text style={s.date}>{item.date}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  dim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: { fontSize: 16, fontWeight: '800', color: '#111827' },
  close: { fontSize: 18 },
  emptyWrap: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 6,
  },
  emptyText: { fontSize: 14, fontWeight: '600', color: '#4b5563' },
  emptySub: { fontSize: 12, color: '#9ca3af' },
  list: {
    paddingTop: 8,
    paddingBottom: 16,
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#fdf2ff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f5d0fe',
    marginBottom: 10,
  },
  emoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  meta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  date: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
})
