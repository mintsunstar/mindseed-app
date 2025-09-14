// components/NotifPanel.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { useApp } from '@/store/useApp';

export default function NotifPanel() {
  const app = useApp();
  const [open, setOpen] = useState(false);

  const unread = useMemo(() => app.notifications.filter(n => !n.read).length, [app.notifications]);

  const openPanel = () => setOpen(true);
  const closePanel = () => setOpen(false);
  const markAll = async () => { await app.markAllRead(); };

  return (
    <>
      {/* 🔔 버튼 */}
      <Pressable style={s.bell} onPress={openPanel} accessibilityLabel="알림 열기">
        <Text style={{ fontSize: 20 }}>🔔</Text>
        {unread > 0 && (
          <View style={s.badge}>
            <Text style={s.badgeTxt}>{unread > 9 ? '9+' : unread}</Text>
          </View>
        )}
      </Pressable>

      {/* 모달 시트 */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={closePanel}>
        {/* 배경 (탭하면 닫힘) */}
        <Pressable style={s.backdrop} onPress={closePanel} />
        {/* 바텀 시트 */}
        <View style={s.sheet}>
          <View style={s.sheetHeader}>
            <Text style={s.title}>알림</Text>
            <Pressable onPress={markAll}><Text style={s.link}>모두 읽음</Text></Pressable>
          </View>

          <View style={{ gap: 10 }}>
            {app.notifications.length === 0 ? (
              <Text style={{ color: '#666' }}>새 알림이 없어요.</Text>
            ) : (
              app.notifications.map(n => (
                <View key={n.id} style={s.item}>
                  <Text style={s.itemTitle}>
                    {n.type === 'empathy' ? '공감' : n.type === 'bloom' ? '개화' : n.type === 'streak' ? '기록' : '알림'}
                    {n.read ? '' : ' •'}
                  </Text>
                  <Text style={s.itemTxt}>{n.text}</Text>
                </View>
              ))
            )}
          </View>

          <Pressable style={s.primary} onPress={closePanel} accessibilityLabel="알림 닫기">
            <Text style={s.primaryTxt}>닫기</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  bell: { paddingHorizontal: 8, paddingVertical: 6, position: 'relative' },
  badge: {
    position: 'absolute', right: 2, top: 0,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: '#E02424', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  badgeTxt: { color: '#fff', fontSize: 10, fontWeight: '800' },

  // 🔧 inset:0 대신 top/left/right/bottom 사용
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },

  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16,
    padding: 16, gap: 12,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '900' },
  link: { color: '#1f1f1f', fontWeight: '700' },

  item: { backgroundColor: '#fafafa', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#eee' },
  itemTitle: { fontWeight: '800', marginBottom: 4 },
  itemTxt: { color: '#333' },

  primary: { backgroundColor: '#1f1f1f', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  primaryTxt: { color: '#fff', fontWeight: '800' },
});
