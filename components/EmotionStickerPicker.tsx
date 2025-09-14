// components/EmotionStickerPicker.tsx
import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Emotion } from '@/store/useApp';

export type EmotionKey = Emotion | '공허';

export interface StickerItem {
  key: EmotionKey;
  label: string;
  emoji: string;
}

const DEFAULT_STICKERS: StickerItem[] = [
  { key: '기쁨', label: '기쁨', emoji: '😊' },
  { key: '설렘', label: '설렘', emoji: '✨' },
  { key: '슬픔', label: '슬픔', emoji: '😢' },
  { key: '불안', label: '불안', emoji: '😟' },
  { key: '분노', label: '분노', emoji: '😠' },
  { key: '외로움', label: '외로움', emoji: '🥲' },
  { key: '공허', label: '공허', emoji: '🌫️' },
];

type Props = {
  value: EmotionKey;
  onChange: (k: EmotionKey) => void;
  items?: StickerItem[];
  style?: ViewStyle;
  dense?: boolean; // 조밀한 레이아웃 옵션
};

function EmotionStickerPickerImpl({
  value,
  onChange,
  items = DEFAULT_STICKERS,
  style,
  dense,
}: Props) {
  return (
    <View style={[s.wrap, style, dense && { gap: 6 }]}>
      {items.map((st) => {
        const on = st.key === value;
        return (
          <Pressable
            key={st.key}
            onPress={() => onChange(st.key)}
            style={[s.item, on && s.itemOn, dense && s.itemDense]}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={st.label}
          >
            <Text style={[s.emoji, dense && { fontSize: 18 }]}>{st.emoji}</Text>
            <Text style={[s.label, on && s.labelOn, dense && { marginTop: 2 }]}>
              {st.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ✅ memo에 구현한 컴포넌트를 넣어 export
export const EmotionStickerPicker = memo(EmotionStickerPickerImpl);

// 외부에서 기본 스티커셋을 가져가고 싶을 때 사용
export const DEFAULT_EMOTION_STICKERS = DEFAULT_STICKERS;

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  item: {
    borderWidth: 1,
    borderColor: '#ece7e2',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 72,
  },
  itemDense: { paddingHorizontal: 10, paddingVertical: 8, minWidth: 64 },
  itemOn: { backgroundColor: '#1f1f1f', borderColor: '#1f1f1f' },
  emoji: { fontSize: 22 },
  label: { marginTop: 4, color: '#222' },
  labelOn: { color: '#fff', fontWeight: '800' },
});
