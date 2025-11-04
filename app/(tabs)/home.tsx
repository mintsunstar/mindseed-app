import React, { useEffect, useMemo, useState } from 'react'
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Modal,
  Platform,
  ToastAndroid,
} from 'react-native'

import NotifPanel from '@/components/NotifPanel'
import RecordDetailModal from '@/components/RecordDetailModal'
import Card from '@/components/Card'
import Section from '@/components/Section'
import WeekCalendar from '@/components/WeekCalendar'
import FlowerGrowth from '@/components/Flower/FlowerGrowth'
import FlowerGauge from '@/components/FlowerGauge' // 폴백용
import MonthCalendar from '@/components/MonthCalendar'

import { useApp } from '@/store/useApp'
import { fmtDate } from '@/lib/date'

/* ───────────────────────────────────────────────────────── */
/* ErrorBoundary: 하위 컴포넌트 렌더 오류가 나도 홈 전체가 죽지 않게 */
class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) return this.props.fallback as any
    return this.props.children as any
  }
}
/* ───────────────────────────────────────────────────────── */

// 주 시작(일요일) 계산
function weekStartOf(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const wd = d.getDay()
  d.setDate(d.getDate() - wd)
  return d
}

function toast(msg: string) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT)
  else Alert.alert('', msg)
}

/** % → 단계 텍스트 */
function stageLabelByPct(p: number) {
  if (p >= 100) return '개화'
  if (p >= 70) return '반쯤핀꽃'
  if (p >= 50) return '꽃봉오리'
  if (p >= 30) return '줄기'
  if (p >= 10) return '새싹'
  return '씨앗'
}

export default function Home() {
  const app = useApp()

  // 씨앗명 편집
  const [editing, setEditing] = useState(false)
  const [seed, setSeed] = useState(app.seedName)

  // 주간 달력
  const [weekStart, setWeekStart] = useState<Date>(() => weekStartOf(new Date()))
  const prevWeek = () =>
    setWeekStart((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() - 7)
      return d
    })
  const nextWeek = () =>
    setWeekStart((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + 7)
      return d
    })

  // 월간 달력 모달 & 상세 모달
  const [showMonth, setShowMonth] = useState(false)
  const [detailRec, setDetailRec] = useState<ReturnType<typeof app.getRecordByDate> | null>(null)

  useEffect(() => {
    app.load()
  }, [])
  useEffect(() => {
    setSeed(app.seedName)
  }, [app.seedName])

  const today = fmtDate(new Date())

  // 성장 포인트(0~100)
  const growthPt = useMemo(() => {
    if (typeof app.getGrowthPt === 'function') return app.getGrowthPt()
    let pt = 0
    for (const r of app.records) {
      pt += r.isPublic ? 10 : 5
      pt += (r.likes ?? 0) * 2
    }
    return Math.min(100, pt)
  }, [app.records])

  // 요약 수치
  const totalLikes = app.records.reduce((a, r) => a + (r.likes ?? 0), 0)
  const req1 = app.records.length >= 5
  const req2 = totalLikes >= 20
  const todayLikes = app.getRecordByDate?.(today)?.likes ?? 0

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container}>
      {/* 상단 */}
      <View style={s.topbar}>
        <Text style={s.topTitle}>마음씨</Text>
        <NotifPanel />
      </View>

      {/* 나의 정원 */}
      <Card>
        {/* ⛔️ 달력 아이콘은 여기서 제거하여 레이아웃 틀어짐 방지 */}
        <Section title="나의 정원" subtitle="기록 +pt · 공감 자동 반영">
          <View style={s.gardenBox}>
            {/* 게이지 + Lottie (오류 시 게이지만) */}
            <ErrorBoundary fallback={<FlowerGauge pt={growthPt} hideLabels />}>
              <FlowerGrowth pt={growthPt} hideLabels />
            </ErrorBoundary>

            {/* 단계/퍼센트 텍스트 표기 */}
            <View style={s.stageBox}>
              <Text style={s.stageName}>{stageLabelByPct(growthPt)} 단계</Text>
              <Text style={s.stagePct}>{Math.round(growthPt)}%</Text>
            </View>

            {/* 씨앗명 편집 */}
            {!editing ? (
              <View style={s.seedRow}>
                <Text style={s.seed}>{app.seedName}</Text>
                <Pressable onPress={() => setEditing(true)}>
                  <Text>✏️</Text>
                </Pressable>
              </View>
            ) : (
              <View style={s.seedEditRow}>
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
                    const v = seed.trim()
                    if (!v) return Alert.alert('씨앗명은 1~16자')
                    await app.setSeedName(v)
                    setEditing(false)
                  }}
                >
                  <Text style={s.btnTxt}>저장</Text>
                </Pressable>
                <Pressable
                  style={[s.btn, s.ghost]}
                  onPress={() => {
                    setSeed(app.seedName)
                    setEditing(false)
                  }}
                >
                  <Text>취소</Text>
                </Pressable>
              </View>
            )}

            <Text>
              오늘의 정원 소식 ·{' '}
              <Text style={s.bold}>오늘 내 씨앗이 {todayLikes}번 공감받았어요!</Text>
            </Text>

            {/* 이번 주 요약 뱃지 */}
            <View style={s.reqs}>
              <Text style={[s.req, req1 && s.ok]}>
                {req1 ? '✅' : '◻'} 기록 {app.records.length}회
              </Text>
              <Text style={[s.req, req2 && s.ok]}>
                {req2 ? '✅' : '◻'} 받은 공감 {totalLikes}회
              </Text>
            </View>
          </View>
        </Section>
      </Card>

      {/* 주간 감정 달력 — 📅 아이콘을 여기 오른쪽에 배치 */}
      <Card>
        <Section
          title="주간 감정 달력"
          subtitle="스티커를 눌러 기록 보기"
          right={
            <Pressable
              onPress={() => setShowMonth(true)}
              hitSlop={8}
              accessibilityLabel="월간 달력"
            >
              <Text style={{ fontSize: 18 }}>📅</Text>
            </Pressable>
          }
        >
          <WeekCalendar
            records={app.records}
            currentStart={weekStart}
            onPrevWeek={prevWeek}
            onNextWeek={nextWeek}
            today={today}
            onPick={(date) => {
              // 미래 날짜 방지
              if (date > today) {
                toast('미래 날짜는 기록할 수 없어요!')
                return
              }
              const r = app.getRecordByDate?.(date) ?? app.records.find((x) => x.date === date)
              if (!r) {
                Alert.alert('기록 없음', `${date}에는 기록이 없어요.`)
                return
              }
              setDetailRec(r)
            }}
          />
          <Text style={s.helper}>
            비어있는 날은 연한 회색으로, 기록한 날은 감정 컬러 스티커가 보여요.
          </Text>
        </Section>
      </Card>

      {/* 기록 상세 모달 */}
      {detailRec && (
        <RecordDetailModal
          visible={!!detailRec}
          record={detailRec}
          onClose={() => {
            setDetailRec(null)
            app.load()
          }}
        />
      )}

      {/* 월간 달력 모달 */}
      <Modal
        visible={showMonth}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMonth(false)}
      >
        <View style={s.modalDim}>
          <View style={s.modalSheet}>
            <View style={s.modalHeader}>
              <Text style={{ fontWeight: '900' }}>월간 감정 달력</Text>
              <Pressable onPress={() => setShowMonth(false)}>
                <Text style={{ fontSize: 18 }}>✕</Text>
              </Pressable>
            </View>

            <MonthCalendar
              records={app.records}
              today={today}
              onPick={(date) => {
                if (date > today) {
                  toast('미래 날짜는 기록할 수 없어요!')
                  return
                }
                const r = app.getRecordByDate?.(date) ?? app.records.find((x) => x.date === date)
                if (!r) {
                  Alert.alert('기록 없음', `${date}에는 기록이 없어요.`)
                  return
                }
                setShowMonth(false)
                setDetailRec(r)
              }}
              onClose={() => setShowMonth(false)}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

/* ───────────────────────── styles ───────────────────────── */
const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#fffdfb' },
  container: { gap: 12, padding: 12, paddingBottom: 96 },

  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  topTitle: { fontWeight: '900', fontSize: 18 },

  gardenBox: { alignItems: 'center', gap: 10 },

  stageBox: { alignItems: 'center', marginTop: 6, gap: 2 },
  stageName: { fontWeight: '800', fontSize: 15 },
  stagePct: { color: '#666' },

  seedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  seedEditRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  seed: { fontSize: 16, fontWeight: '800' },

  input: {
    borderWidth: 1,
    borderColor: '#ece7e2',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 160,
    backgroundColor: '#fff',
  },
  btn: { backgroundColor: '#1f1f1f', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  btnTxt: { color: '#fff', fontWeight: '700' },
  ghost: { backgroundColor: '#fff' },
  bold: { fontWeight: '800' },

  reqs: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 6 },
  req: {
    borderWidth: 1,
    borderColor: '#ece7e2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  ok: { borderColor: '#d6f2e6', backgroundColor: '#f5fffa', color: '#2a7a5c' },

  helper: { color: '#888', marginTop: 8 },

  modalDim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    minHeight: 420,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
})
