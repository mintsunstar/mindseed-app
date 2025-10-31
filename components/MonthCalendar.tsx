// components/MonthCalendar.tsx
import React, { useMemo, useState } from 'react'
import { View, Text, Pressable, StyleSheet, Platform, ToastAndroid, Alert } from 'react-native'

type Rec = { date: string; emotion?: string }
type Props = {
  records: Rec[]
  today: string // "YYYY-MM-DD"
  initialMonth?: Date // 없으면 오늘 기준
  onPick: (date: string) => void // 날짜 선택 콜백
  onClose?: () => void
}

// 감정 → 점 색상 (원하면 바꿔도 됨)
const EMO_COLOR: Record<string, string> = {
  행복: '#ffb300',
  기쁨: '#ff7f50',
  평온: '#4caf50',
  슬픔: '#6a7bd9',
  분노: '#ef5350',
  불안: '#8e24aa',
}

function toast(msg: string) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT)
  else Alert.alert('', msg)
}

export default function MonthCalendar({ records, today, initialMonth, onPick, onClose }: Props) {
  // monthCursor: 해당 월의 1일
  const [cursor, setCursor] = useState<Date>(() => {
    const base = initialMonth ?? new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })
  const todayDate = useMemo(() => new Date(`${today}T00:00:00`), [today])

  // 달력 6주(7x6) 그리드 생성: 해당 월 1일의 주(일요일 시작)로부터 42칸
  const cells = useMemo(() => {
    const y = cursor.getFullYear()
    const m = cursor.getMonth() // 0~11
    const first = new Date(y, m, 1)
    const start = new Date(first)
    // 일요일로 맞춤
    start.setDate(1 - first.getDay())

    const arr: {
      key: string
      d: Date
      inMonth: boolean
      rec?: Rec
    }[] = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const y2 = d.getFullYear()
      const m2 = `${d.getMonth() + 1}`.padStart(2, '0')
      const dd = `${d.getDate()}`.padStart(2, '0')
      const dateStr = `${y2}-${m2}-${dd}`
      const rec = records.find((r) => r.date === dateStr)
      arr.push({
        key: dateStr,
        d,
        inMonth: d.getMonth() === m,
        rec,
      })
    }
    return arr
  }, [cursor, records])

  const title = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`

  return (
    <View>
      {/* 헤더 */}
      <View style={s.header}>
        <Pressable
          style={s.nav}
          onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
        >
          <Text style={s.navTxt}>‹</Text>
        </Pressable>
        <Text style={s.title}>{title}</Text>
        <Pressable
          style={s.nav}
          onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
        >
          <Text style={s.navTxt}>›</Text>
        </Pressable>
      </View>

      {/* 요일 */}
      <View style={s.weekHeader}>
        {['일', '월', '화', '수', '목', '금', '토'].map((w) => (
          <Text key={w} style={s.weekTxt}>
            {w}
          </Text>
        ))}
      </View>

      {/* 달력 그리드 */}
      <View style={s.grid}>
        {cells.map(({ key, d, inMonth, rec }) => {
          const isFuture = d.getTime() > todayDate.getTime()
          const isToday =
            d.getFullYear() === todayDate.getFullYear() &&
            d.getMonth() === todayDate.getMonth() &&
            d.getDate() === todayDate.getDate()

          const color = (rec?.emotion && EMO_COLOR[rec.emotion]) || (rec ? '#222' : 'transparent')

          return (
            <Pressable
              key={key}
              onPress={() => {
                const y = d.getFullYear()
                const m = `${d.getMonth() + 1}`.padStart(2, '0')
                const dd = `${d.getDate()}`.padStart(2, '0')
                const dateStr = `${y}-${m}-${dd}`
                if (isFuture) {
                  toast('미래 날짜는 기록할 수 없어요')
                  return
                }
                onPick(dateStr)
                onClose?.()
              }}
              style={[s.cell, !inMonth && s.outMonth]}
            >
              <Text style={[s.dayNum, isToday && s.todayNum]}>{d.getDate()}</Text>
              <View style={[s.dot, { backgroundColor: color }]} />
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: { fontWeight: '900', fontSize: 16 },
  nav: { paddingHorizontal: 8, paddingVertical: 4 },
  navTxt: { fontSize: 18 },

  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  weekTxt: { width: `${100 / 7}%`, textAlign: 'center', color: '#777', fontSize: 12 },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 2,
  },
  outMonth: { opacity: 0.35 },
  dayNum: { fontWeight: '700', color: '#333' },
  todayNum: { color: '#000', textDecorationLine: 'underline' },
  dot: { marginTop: 6, width: 8, height: 8, borderRadius: 4 },
})
