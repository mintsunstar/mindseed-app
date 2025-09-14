// components/WeekCalendar.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { fmtDate } from '@/lib/date';

const EMO_EMOJI: Record<string, string> = {
  '기쁨':'😊','슬픔':'😢','불안':'😟','분노':'😠','외로움':'🥲','설렘':'🥰','공허':'😶‍🌫️'
};

// 주 시작(일요일 기준, 월요일 기준이면 (wd+6)%7 로 바꿔도 됨)
function weekStartOf(d = new Date()) {
  const x = new Date(d);
  const wd = x.getDay(); // 일0~토6
  x.setDate(x.getDate() - wd);
  x.setHours(0,0,0,0);
  return x;
}
function makeWeek(start: Date) {
  return [...Array(7)].map((_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export default function WeekCalendar({
  records,
  onPick,
  currentStart,
  onPrevWeek,
  onNextWeek,
}: {
  records: Array<{ date: string; emotion: string; content?: string }>;
  onPick: (date: string) => void;
  /** 현재 주의 시작일(없으면 오늘 기준) */
  currentStart?: Date;
  /** ‘이전 주’, ‘다음 주’ 콜백(없으면 버튼 비활성) */
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
}) {
  const start = weekStartOf(currentStart ?? new Date());
  const days = makeWeek(start);
  const todayKey = fmtDate(new Date());

  const label = (() => {
    const end = new Date(start); end.setDate(end.getDate() + 6);
    const f = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
    return `${f(start)} - ${f(end)}`;
  })();

  return (
    <View>
      {/* 헤더: 좌/우 이동 + 주 라벨 */}
      <View style={s.header}>
        <Text
          style={[s.arrow, !onPrevWeek && s.arrowDisabled]}
          onPress={onPrevWeek}
        >‹</Text>
        <Text style={s.label}>{label}</Text>
        <Text
          style={[s.arrow, !onNextWeek && s.arrowDisabled]}
          onPress={onNextWeek}
        >›</Text>
      </View>

      {/* 날짜 그리드 */}
      <View style={s.grid}>
        {days.map((d, i) => {
          const key = fmtDate(d);
          const rec = records.find(r => r.date === key);
          return (
            <Pressable
              key={i}
              onPress={() => rec && onPick(key)}
              style={[s.cell, key === todayKey && s.today]}
            >
              <Text style={s.date}>{d.getMonth() + 1}/{d.getDate()}</Text>
              {rec && <Text style={s.sticker}>{EMO_EMOJI[rec.emotion] ?? '🌱'}</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:8 },
  arrow:{ fontSize:20, paddingHorizontal:6 },
  arrowDisabled:{ opacity:0.3 },
  label:{ fontWeight:'800' },

  grid:{ flexDirection:'row', justifyContent:'space-between', gap:8 },
  cell:{ flex:1, borderWidth:1, borderColor:'#ece7e2', padding:8, borderRadius:10, minHeight:56, position:'relative', backgroundColor:'#fff' },
  today:{ borderColor:'#7fb3ff' },
  date:{ fontSize:12, color:'#444' },
  sticker:{ position:'absolute', right:8, bottom:4, fontSize:16 },
});
