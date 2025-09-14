// components/Section.tsx
import React, { PropsWithChildren, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;   // 우측 아이콘/버튼 영역
} & PropsWithChildren;

export default function Section({ title, subtitle, right, children }: Props) {
  return (
    <View style={s.wrap}>
      {/* 타이틀 + 오른쪽 */}
      <View style={s.head}>
        <Text style={s.title}>{title}</Text>
        {right ? <View style={s.right}>{right}</View> : null}
      </View>

      {/* 서브타이틀은 타이틀 아래 */}
      {subtitle ? <Text style={s.sub}>{subtitle}</Text> : null}

      {/* 컨텐츠 */}
      <View>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 8, marginBottom: 12 },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '800', color: colors.ink },
  sub: { fontSize: 12, color: colors.muted },
  right: { marginLeft: 8 }, // 우측 영역 여백
});
