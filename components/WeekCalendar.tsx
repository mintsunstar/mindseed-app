// components/WeekCalendar.tsx
import React from 'react'
import { View, Text, Pressable, StyleSheet, Platform, Alert, ToastAndroid } from 'react-native'
import { fmtDate } from '@/lib/date'

type Emotion = string
type RecordItem = {
  id: string
  date: string
  emotion: Emotion
  isPublic: boolean
  likes?: number
}

type Props = {
  records: RecordItem[]
  /** Date 또는 문자열(YYYY-MM-DD)이 와도 처리 */
  currentStart: Date | string
  onPrevWeek: () => void
  onNextWeek: () => void
  onPick: (date: string) => void
  today?: string
  dimEmptyDays?: boolean
}

function startOfWeek(d: Date) {
  const x = new Date(d)
  const wd = x.getDay() // 일(0)~토(6)
  x.setHours(0, 0, 0, 0)
  x.setDate(x.getDate() - wd)
  return x
}

export default function WeekCalendar({
  records,
  currentStart,
  onPrevWeek,
  onNextWeek,
  onPick,
  today,
  dimEmptyDays = true,
}: Props) {
  const EMOJI: Record<string, string> = {
    기쁨: '😊',
    설렘: '✨',
    슬픔: '😢',
    울음: '😭',
    분노: '😡',
    외로움: '🥲',
    우울: '🌧️',
    평온: '🌿',
    default: '•',
  }

  // ---------- 안전한 시작일 정규화 ----------
  let start: Date
  if (currentStart instanceof Date) {
    start = new Date(currentStart.getTime())
  } else if (typeof currentStart === 'string') {
    // 문자열이면 파싱(YYYY-MM-DD 지원)
    const parts = currentStart.split('-').map(Number)
    if (parts.length === 3) start = new Date(parts[0], parts[1] - 1, parts[2])
    else start = new Date(currentStart) // 마지막 시도
  } else {
    start = new Date()
  }
  if (isNaN(start.getTime())) {
    // 최후 방어: 오늘 주의 시작일로 대체
    start = startOfWeek(new Date())
  }
  // ----------------------------------------

  const TODAY = today ?? fmtDate(new Date())

  const toast = (msg: string) => {
    if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT)
    else Alert.alert('', msg)
  }

  // 이번 주 7일
  const days: { label: string; date: string }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start.getTime())
    d.setDate(d.getDate() + i)
    days.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, date: fmtDate(d) }) // 여기서 Invalid 방지됨
  }

  // 날짜 → 대표 이모지
  const emojiByDate = new Map<string, string>()
  for (const day of days) {
    const list = records.filter((r) => r.date === day.date)
    if (list.length) {
      const last = list[list.length - 1]
      const em = EMOJI[last.emotion] ?? EMOJI.default
      emojiByDate.set(day.date, em)
    }
  }

  const handlePress = (date: string) => {
    if (date > TODAY) {
      toast('미래날짜는 기록할 수 없어요!')
      return
    }
    onPick(date)
  }

  return (
    <View style={s.wrap}>
      <View style={s.nav}>
        <Pressable onPress={onPrevWeek} hitSlop={8}>
          <Text>‹</Text>
        </Pressable>
        <Text style={s.title}>
          {days[0].date} ~ {days[6].date}
        </Text>
        <Pressable onPress={onNextWeek} hitSlop={8}>
          <Text>›</Text>
        </Pressable>
      </View>

      <View style={s.row}>
        {days.map((d) => {
          const emoji = emojiByDate.get(d.date)
          const isFuture = d.date > TODAY
          const isEmpty = !emoji

          return (
            <Pressable
              key={d.date}
              style={[s.cell, dimEmptyDays && isEmpty && s.cellEmpty, isFuture && s.cellFuture]}
              onPress={() => handlePress(d.date)}
            >
              <Text style={s.day}>{d.label}</Text>
              <Text style={s.emoji}>{emoji ?? ''}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { gap: 8 },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cell: {
    width: 44,
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ece7e2',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  cellEmpty: {
    backgroundColor: '#faf8f6',
    borderColor: '#eee',
    opacity: 0.6,
  },
  cellFuture: {
    opacity: 0.45,
  },
  day: { fontSize: 11, color: '#777' },
  emoji: { fontSize: 18, marginTop: 2 },
})
