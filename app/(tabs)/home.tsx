// app/(tabs)/home.tsx
import React, { useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TextInput, Pressable, Alert, Modal
} from 'react-native';

import NotifPanel from '@/components/NotifPanel';
import RecordDetailModal from '@/components/RecordDetailModal';

import Card from '@/components/Card';
import Section from '@/components/Section';
import WeekCalendar from '@/components/WeekCalendar';
import FlowerGauge from '@/components/FlowerGauge';

import { useApp } from '@/store/useApp';
import { fmtDate } from '@/lib/date';

// 주 시작(일요일 기준)
function weekStartOf(date = new Date()) {
  const d = new Date(date);
  const wd = d.getDay(); // 일0~토6
  d.setDate(d.getDate() - wd);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function Home() {
  const app = useApp();

  const [editing, setEditing] = useState(false);
  const [seed, setSeed] = useState(app.seedName);

  // 주간 달력: 현재 주 시작일
  const [weekStart, setWeekStart] = useState<Date>(weekStartOf(new Date()));
  const prevWeek = () => { const d=new Date(weekStart); d.setDate(d.getDate()-7); setWeekStart(d); };
  const nextWeek = () => { const d=new Date(weekStart); d.setDate(d.getDate()+7); setWeekStart(d); };

  // 월간 달력 모달
  const [showMonth, setShowMonth] = useState(false);

  // 상세 모달
  const [detailRec, setDetailRec] =
    useState<ReturnType<typeof app.getRecordByDate> | null>(null);

  useEffect(() => { app.load(); }, []);
  useEffect(() => { setSeed(app.seedName); }, [app.seedName]);

  const today = fmtDate(new Date());
  const todayRec = app.records.find(r => r.date === today);
  const todayLikes = todayRec?.likes ?? 0;

  const totalLikes = app.records.reduce((a, r) => a + (r.likes || 0), 0);
  const req1 = app.records.length >= 5;
  const req2 = totalLikes >= 20;

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      {/* 상단 알림 아이콘/패널 */}
      <View style={s.topbar}>
        <Text style={s.topTitle}>마음씨</Text>
        <NotifPanel />
      </View>

      {/* 나의 정원 */}
      <Card>
        <Section title="나의 정원" subtitle="기록 +10 · 공감 자동 반영">
          <View style={{ alignItems: 'center', gap: 8 }}>
            {/* 겹침 방지: FlowerGauge 내부 라벨 숨김 */}
            <FlowerGauge pct={app.growthPct} hideLabels />

            {!editing ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={s.seed}>{app.seedName}</Text>
                <Pressable onPress={() => setEditing(true)}><Text>✏️</Text></Pressable>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TextInput
                  style={s.input}
                  value={seed}
                  onChangeText={setSeed}
                  placeholder="씨앗명"
                  maxLength={16}
                />
                <Pressable
                  style={s.btn}
                  onPress={async () => {
                    if (!seed.trim()) return Alert.alert('씨앗명은 1~16자');
                    await app.setSeedName(seed.trim());
                    setEditing(false);
                  }}
                ><Text style={s.btnTxt}>저장</Text></Pressable>
                <Pressable
                  style={[s.btn, s.ghost]}
                  onPress={() => { setSeed(app.seedName); setEditing(false); }}
                ><Text>취소</Text></Pressable>
              </View>
            )}

            <Text>
              오늘의 정원 소식 · <Text style={s.bold}>오늘 내 씨앗이 {todayLikes}번 공감받았어요!</Text>
            </Text>

            <View style={s.reqs}>
              <Text style={[s.req, req1 && s.ok]}>{req1 ? '✅' : '◻'} 기록 {app.records.length}회</Text>
              <Text style={[s.req, req2 && s.ok]}>{req2 ? '✅' : '◻'} 받은 공감 {totalLikes}회</Text>
            </View>
          </View>
        </Section>
      </Card>

      {/* 주간 감정 달력 */}
      <Card>
        <Section
          title="주간 감정 달력"
          subtitle="스티커를 눌러 기록 보기"
          right={
            <Pressable onPress={() => setShowMonth(true)} hitSlop={8}>
              <Text style={{ fontSize: 18 }}>📅</Text>
            </Pressable>
          }
        >
          <WeekCalendar
            records={app.records}
            currentStart={weekStart}
            onPrevWeek={prevWeek}
            onNextWeek={nextWeek}
            onPick={(date) => {
              const r = (app as any).getRecordByDate
                ? (app as any).getRecordByDate(date)
                : app.records.find(x => x.date === date);
              if (!r) return Alert.alert('기록 없음', `${date}에는 기록이 없어요.`);
              setDetailRec(r);
            }}
          />
          <Text style={{ color: '#888', marginTop: 8 }}>월간 달력은 추후 실제 컴포넌트로 교체 예정.</Text>
        </Section>
      </Card>

      {/* 기록 상세 모달 */}
      {detailRec && (
        <RecordDetailModal
          visible={!!detailRec}
          record={detailRec}
          onClose={() => { setDetailRec(null); app.load(); }}
        />
      )}

      {/* 월간 달력 모달 (임시) */}
      <Modal visible={showMonth} transparent animationType="slide" onRequestClose={() => setShowMonth(false)}>
        <View style={s.modalDim}>
          <View style={s.modalSheet}>
            <View style={s.modalHeader}>
              <Text style={{ fontWeight: '900' }}>월간 달력 (준비중)</Text>
              <Pressable onPress={() => setShowMonth(false)}><Text style={{ fontSize: 18 }}>✕</Text></Pressable>
            </View>
            <Text style={{ color: '#666' }}>여기에 월간 달력 컴포넌트를 넣으면 됩니다.</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#fffdfb' },
  container: { gap: 12, padding: 12, paddingBottom: 28 },

  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  topTitle: { fontWeight: '900', fontSize: 18 },

  seed: { fontSize: 16, fontWeight: '800' },
  input: {
    borderWidth: 1, borderColor: '#ece7e2', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8, minWidth: 160, backgroundColor: '#fff'
  },
  btn: { backgroundColor: '#1f1f1f', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  btnTxt: { color: '#fff', fontWeight: '700' },
  ghost: { backgroundColor: '#fff' },
  bold: { fontWeight: '800' },

  reqs: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 6 },
  req: { borderWidth: 1, borderColor: '#ece7e2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#fff' },
  ok: { borderColor: '#d6f2e6', backgroundColor: '#f5fffa', color: '#2a7a5c' },

  modalDim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, minHeight: 300 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
});
