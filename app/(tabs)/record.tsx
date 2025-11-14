// app/(tabs)/record.tsx
// ✅ 이렇게 한 번만 가져오세요
import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Image,
  ScrollView,
  Platform,
  ToastAndroid, // 안드 전용 토스트 쓰려면 유지, 아니면 제거
} from 'react-native'
import { router } from 'expo-router'

import * as ImagePicker from 'expo-image-picker'
import * as Haptics from 'expo-haptics'

import Card from '@/components/Card'
import Section from '@/components/Section'
import { useApp, Emotion, Category } from '@/store/useApp'
import { fmtDate } from '@/lib/date'
import { EmotionStickerPicker } from '@/components/EmotionStickerPicker'
import SeedLaunch from '@/components/SeedLaunch'

const CATEGORIES: Category[] = ['일상', '고민', '연애', '회사', '유머', '성장', '자기돌봄']

// ===== 정책 상수 =====
const MAX_PUBLIC_PER_DAY = 3
const MIN_LEN = 5
const MAX_LEN = 1000
const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10MB
// =====================
// 간단 토스트 (iOS/웹은 추후 스낵바로 교체)
function toast(msg: string) {
  if (Platform.OS === 'android' && ToastAndroid?.show) {
    ToastAndroid.show(msg, ToastAndroid.SHORT)
  } else {
    console.log('[TOAST]', msg) // 또는 Alert.alert('', msg)
  }
}

export default function RecordScreen() {
  const app = useApp()
  const today = fmtDate(new Date())
  const prev = app.records.find((r) => r.date === today)

  // 상태
  const [emotion, setEmotion] = useState<Emotion>((prev?.emotion as Emotion) ?? '기쁨')
  const [text, setText] = useState(prev?.content ?? '')
  const [isPublic, setIsPublic] = useState(prev?.isPublic ?? false) // 기본값 비공개
  const [category, setCategory] = useState<Category | undefined>(prev?.category)
  const [imgUri, setImgUri] = useState<string | undefined>(prev?.imageUri)

  const [launchKey, setLaunchKey] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  // 오늘 작성 현황
  const todayPublicCount = useMemo(
    () => app.records.filter((r) => r.date === today && r.isPublic).length,
    [app.records, today]
  )
  const hasTodayPrivate = useMemo(
    () => app.records.some((r) => r.date === today && !r.isPublic),
    [app.records, today]
  )

  const len = text.trim().length

  const canSave = useMemo(() => {
    if (len < MIN_LEN || len > MAX_LEN) return false
    if (isPublic && !category) return false
    return true
  }, [len, isPublic, category])

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!perm.granted) return Alert.alert('사진 접근 권한이 필요해요.')

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
      })
      if (!res.canceled && res.assets?.[0]?.uri) {
        const a = res.assets[0] as any
        // 용량 체크(플랫폼에 따라 fileSize 미제공일 수 있음)
        if (typeof a.fileSize === 'number' && a.fileSize > MAX_IMAGE_BYTES) {
          return Alert.alert('이미지 용량 제한', '이미지는 10MB 이하만 첨부할 수 있어요.')
        }
        // 확장자 가벼운 검증
        const okExt = /\.(jpg|jpeg|png|webp)$/i.test(a.uri)
        if (!okExt) {
          return Alert.alert('지원하지 않는 형식', 'jpg, png, webp 형식만 가능합니다.')
        }
        setImgUri(a.uri)
      }
    } catch (e) {
      Alert.alert('이미지 선택 오류', String(e))
    }
  }
  const removeImage = () => setImgUri(undefined)

  // 웹에서는 haptics 미지원 → 안전 가드
  async function pingHaptic() {
    try {
      if (Platform.OS !== 'web') {
        const h: any = Haptics
        const hasCheck = typeof h.isAvailableAsync === 'function'
        const ok = hasCheck ? await h.isAvailableAsync() : true

        if (ok && typeof h.selectionAsync === 'function') {
          await h.selectionAsync()
        }
      }
    } catch {}
  }

  const save = async () => {
    // 정책 검증
    if (len < MIN_LEN)
      return Alert.alert('조금만 더 적어볼까요?', `최소 ${MIN_LEN}자 이상 입력해 주세요.`)
    if (len > MAX_LEN) return Alert.alert('글자 수 초과', `최대 ${MAX_LEN}자까지 작성할 수 있어요.`)
    if (isPublic) {
      if (!category) return Alert.alert('카테고리 필수', '공개 시에는 카테고리를 선택해야 해요.')
      if (!prev?.isPublic && todayPublicCount >= MAX_PUBLIC_PER_DAY) {
        return Alert.alert(
          '오늘의 공개 기록 한도 도달',
          `공개 기록은 하루 ${MAX_PUBLIC_PER_DAY}개까지 가능해요.`
        )
      }
    } else {
      if (!prev || prev.isPublic) {
        if (hasTodayPrivate) {
          return Alert.alert('오늘은 이미 기록했어요', '비공개 기록은 하루 한 번만 가능해요.')
        }
      }
    }

    try {
      setSaving(true)
      await pingHaptic()

      await app.addOrUpdateRecord({
        id: prev?.id,
        date: today,
        emotion,
        content: text.trim(),
        isPublic,
        category,
        imageUri: imgUri,
      })

      // 씨앗 발사 애니메이션
      setLaunchKey(Date.now())

      // 애니메이션 끝나면 토스트 → 홈으로 이동
      setTimeout(async () => {
        toast(
          isPublic ? '🌸 공감숲에 오늘의 감정이 기록되었어요!' : '🌱 오늘의 감정이 기록되었어요!'
        )
        await app.load()
        router.replace('/(tabs)/home')
      }, 950)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <ScrollView
        style={s.container}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <Section title="오늘 날짜" subtitle="자동 표기">
            <Text style={{ fontWeight: '800' }}>{today}</Text>
          </Section>
        </Card>

        {/* 감정 스티커 */}
        <Card>
          <Section title="오늘은 어떤 하루였나요?" subtitle="스티커를 골라주세요">
            <EmotionStickerPicker value={emotion} onChange={(v) => setEmotion(v as Emotion)} />
          </Section>
        </Card>

        {/* 텍스트 + 사진 첨부 */}
        <Card>
          <Section title="오늘 하루에 대해 기록해보아요" subtitle="감정, 사건, 생각… 자유롭게">
            <TextInput
              style={s.textarea}
              multiline
              placeholder="무슨 일이 있었나요?"
              value={text}
              onChangeText={setText}
              maxLength={MAX_LEN}
            />
            <Text style={s.counter}>
              {len}/{MAX_LEN}
            </Text>

            <View style={{ marginTop: 10, gap: 8 }}>
              {imgUri ? (
                <View style={{ alignItems: 'flex-start', gap: 8 }}>
                  <Image
                    source={{ uri: imgUri }}
                    style={{ width: 220, height: 220, borderRadius: 12 }}
                  />
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable style={[s.btn, s.ghost]} onPress={pickImage}>
                      <Text>다시 선택</Text>
                    </Pressable>
                    <Pressable
                      style={[s.btn, { backgroundColor: '#b00020' }]}
                      onPress={removeImage}
                    >
                      <Text style={s.btnTxt}>삭제</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable style={s.btn} onPress={pickImage}>
                  <Text style={s.btnTxt}>사진 첨부</Text>
                </Pressable>
              )}
              <Text style={{ color: '#888' }}>
                ※ “마음씨 전용 스티커팩”은 추후 items prop으로 교체 가능
              </Text>
            </View>
          </Section>
        </Card>

        {/* 공개/비공개 + 카테고리 */}
        <Card>
          <Section title="공개 설정" subtitle="공개 시 공감숲에 반영">
            <View style={s.row}>
              <Text style={s.label}>공개</Text>
              <Pressable
                onPress={() => setIsPublic((v) => !v)}
                style={[s.switch, isPublic && s.switchOn]}
              >
                <View style={[s.knob, isPublic && { left: 22 }]} />
              </Pressable>
            </View>

            {isPublic ? (
              <View style={{ marginTop: 8 }}>
                <Text style={[s.label, { marginBottom: 6 }]}>카테고리 (필수)</Text>
                <View style={s.categories}>
                  {CATEGORIES.map((c) => {
                    const on = c === category
                    return (
                      <Pressable
                        key={c}
                        onPress={() => setCategory(c)}
                        style={[s.chip, on && s.chipOn]}
                      >
                        <Text style={[s.chipTxt, on && s.chipOnTxt]}>{c}</Text>
                      </Pressable>
                    )
                  })}
                </View>
                <Text style={{ marginTop: 6, color: '#888' }}>
                  오늘 남은 공개 기록 {Math.max(0, MAX_PUBLIC_PER_DAY - todayPublicCount)} /{' '}
                  {MAX_PUBLIC_PER_DAY}
                </Text>
              </View>
            ) : (
              <Text style={{ marginTop: 6, color: '#888' }}>
                비공개 기록은 하루 한 번만 가능해요.
              </Text>
            )}
          </Section>
        </Card>

        {/* 저장 */}
        <View style={{ alignItems: 'flex-end' }}>
          <Pressable
            style={[
              s.btn,
              { paddingHorizontal: 18, paddingVertical: 12, opacity: !canSave || saving ? 0.5 : 1 },
            ]}
            onPress={save}
            disabled={!canSave || saving}
          >
            <Text style={s.btnTxt}>{saving ? '저장 중…' : '저장'}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* 저장 후 씨앗이 날아가는 효과 */}
      <SeedLaunch trigger={launchKey} onDone={() => setLaunchKey(null)} />
    </>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffdfb' },

  textarea: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#ece7e2',
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 12,
    textAlignVertical: 'top',
  },
  counter: { alignSelf: 'flex-end', color: '#999', marginTop: 4 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  label: { fontWeight: '800' },

  switch: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ddd',
    position: 'relative',
    padding: 2,
  },
  switchOn: { backgroundColor: '#1f1f1f' },
  knob: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },

  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#ece7e2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  chipOn: { backgroundColor: '#1f1f1f', borderColor: '#1f1f1f' },
  chipTxt: { color: '#222' },
  chipOnTxt: { color: '#fff', fontWeight: '800' },

  btn: { backgroundColor: '#1f1f1f', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  btnTxt: { color: '#fff', fontWeight: '700' },
  ghost: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ece7e2' },
})
