// app/(tabs)/forest.tsx
import React, { useMemo, useState } from 'react'
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

type Category = 'best' | '일상' | '고민' | '연애' | '회사' | '유머' | '성장' | '자기돌봄'

type ForestPost = {
  id: number
  emo: string
  cat: Exclude<Category, 'best'>
  text: string
  time: string
  likes: number
}

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'best', label: 'best' },
  { id: '일상', label: '일상' },
  { id: '고민', label: '고민' },
  { id: '연애', label: '연애' },
  { id: '회사', label: '회사' },
  { id: '유머', label: '유머' },
  { id: '성장', label: '성장' },
  { id: '자기돌봄', label: '자기돌봄' },
]

// HTML 데모에 있었던 더미 데이터 그대로 옮김
const INITIAL_POSTS: ForestPost[] = [
  {
    id: 1,
    emo: '🙂',
    cat: '일상',
    text: '오늘은 커피 향이 참 따뜻하게 느껴졌어요.\n혼자 있는 시간도 나쁘지 않네요.',
    time: '오늘 12:45',
    likes: 12,
  },
  {
    id: 2,
    emo: '😌',
    cat: '연애',
    text: '괜찮은 줄 알았는데 마음이 조금 울렁였어요.\n그래도 내일은 더 나을 거예요.',
    time: '어제 21:10',
    likes: 28,
  },
  {
    id: 3,
    emo: '🤔',
    cat: '고민',
    text: '아침 공기가 맑았어요. 마음이 잠시 고요해졌어요.',
    time: '3시간 전',
    likes: 9,
  },
  {
    id: 4,
    emo: '😄',
    cat: '유머',
    text: '고양이가 내 키보드 위에서 회의했어요. 결론: 간식 추가 🐾',
    time: '1시간 전',
    likes: 31,
  },
  {
    id: 5,
    emo: '🌱',
    cat: '성장',
    text: '작은 루틴을 7일 채웠어요. 꾸준함이 나를 바꾼대요.',
    time: '방금',
    likes: 22,
  },
  {
    id: 6,
    emo: '🧘‍♀️',
    cat: '자기돌봄',
    text: '오늘은 나를 칭찬하기. 여기까지 잘 왔어.',
    time: '어제',
    likes: 17,
  },
  {
    id: 7,
    emo: '💼',
    cat: '회사',
    text: '회의가 길어도 동료가 있어 버텼어요. 함께라서 다행.',
    time: '어제 10:20',
    likes: 14,
  },
]

export default function ForestScreen() {
  const [category, setCategory] = useState<Category>('best')
  const [posts, setPosts] = useState<ForestPost[]>(INITIAL_POSTS)
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set())
  const [toast, setToast] = useState<string | null>(null)

  // 신고 모달 상태
  const [reportOpen, setReportOpen] = useState(false)
  const [reportTargetId, setReportTargetId] = useState<number | null>(null)
  const [reportReason, setReportReason] = useState('부적절한 표현/혐오')
  const [reportMemo, setReportMemo] = useState('')

  // 카테고리 필터링 + best 정렬
  const filtered = useMemo(() => {
    let data = [...posts]
    if (category === 'best') {
      data.sort((a, b) => b.likes - a.likes || b.id - a.id)
    } else {
      data = data.filter((p) => p.cat === category).sort((a, b) => b.id - a.id)
    }
    return data
  }, [category, posts])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const toggleLike = (id: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              likes: likedIds.has(id) ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    )
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    showToast('💧 공감 한 방울이 전해졌어요')
  }

  const handleShare = (post: ForestPost) => {
    const text = `마음숲 ${post.cat} ${post.emo}\n\n${post.text}\n\n#마음씨 #마음숲`
    // 나중에 React Native 공유 API 연동 가능
    console.log('copy/share text:', text)
    showToast('🔗 글이 복사되었어요. 원하는 곳에 붙여넣기 해보세요')
  }

  const openReport = (id: number) => {
    setReportTargetId(id)
    setReportOpen(true)
  }

  const submitReport = () => {
    if (!reportTargetId) return
    setReportOpen(false)
    setReportMemo('')
    showToast('🚩 신고가 접수되었어요. 안전하게 살펴볼게요')

    // 실제로는 서버에 신고 요청 보내는 위치
    console.log('REPORT', {
      id: reportTargetId,
      reason: reportReason,
      memo: reportMemo,
    })

    // UI 상에서 카드 살짝 흐리게 표시하고 싶다면:
    setPosts((prev) => prev.map((p) => (p.id === reportTargetId ? { ...p, text: p.text } : p)))
  }

  const renderPost = ({ item }: { item: ForestPost }) => {
    const liked = likedIds.has(item.id)
    const isBest = category === 'best'

    return (
      <View style={styles.post}>
        <View style={styles.meta}>
          <View style={styles.chip}>
            <Text style={styles.chipEmoji}>{item.emo}</Text>
            <Text style={styles.chipText}>{item.cat}</Text>
          </View>
          {isBest && (
            <View style={styles.bestBadge}>
              <Text style={styles.bestBadgeText}>best</Text>
            </View>
          )}
          <Text style={styles.time}>{item.time}</Text>
        </View>

        <Text style={styles.content}>{item.text}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.likeBtn, liked && styles.likeBtnActive]}
            onPress={() => toggleLike(item.id)}
          >
            <Text style={styles.drop}>💧</Text>
            <Text style={styles.likeCount}>{item.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={() => handleShare(item)}>
            <Text>공유하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.reportBtn]}
            onPress={() => openReport(item.id)}
          >
            <Text style={styles.reportText}>신고</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headLeft}>
          <Text style={styles.seedEmoji}>🌿</Text>
          <View>
            <Text style={styles.title}>마음숲</Text>
            <Text style={styles.subtitle}>공감으로 서로를 가볍게</Text>
          </View>
        </View>
        <Text style={styles.bell}>🔔</Text>
      </View>

      {/* 카테고리 탭 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabs}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {CATEGORIES.map((cat) => {
          const active = cat.id === category
          return (
            <Pressable
              key={cat.id}
              onPress={() => setCategory(cat.id)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{cat.label}</Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {/* 리스트 */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderPost}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
      />

      {/* 토스트 */}
      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      {/* 신고 모달 */}
      <Modal
        visible={reportOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setReportOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>신고하기</Text>
              <Text style={styles.modalSubtitle}>안전한 숲을 위해 내용을 남겨주세요 🌱</Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>사유 선택</Text>
              {/* 아주 간단한 select 대체 */}
              {['부적절한 표현/혐오', '광고/스팸', '개인정보 노출', '기타'].map((reason) => (
                <Pressable
                  key={reason}
                  style={[styles.reasonRow, reportReason === reason && styles.reasonRowActive]}
                  onPress={() => setReportReason(reason)}
                >
                  <Text>{reason}</Text>
                </Pressable>
              ))}

              <Text style={[styles.modalLabel, { marginTop: 12 }]}>추가 메모 (선택)</Text>
              <TextInput
                value={reportMemo}
                onChangeText={setReportMemo}
                multiline
                style={styles.memoInput}
                placeholder="상세한 내용을 적어주시면 검토에 도움이 됩니다."
              />
            </View>

            <View style={styles.modalFoot}>
              <TouchableOpacity
                style={[styles.btn, styles.modalBtn]}
                onPress={() => setReportOpen(false)}
              >
                <Text>닫기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btn,
                  styles.modalBtn,
                  { backgroundColor: '#ff5c7a', borderColor: '#ff9db0' },
                ]}
                onPress={submitReport}
              >
                <Text style={{ color: '#fff' }}>신고 보내기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7faf9',
  },
  header: {
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8efed',
    backgroundColor: '#ffffffcc',
  },
  headLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  seedEmoji: { fontSize: 22 },
  title: { fontWeight: '800', fontSize: 18 },
  subtitle: { fontSize: 12, color: '#6b7b87' },
  bell: { fontSize: 18, color: '#2aa884' },

  tabs: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8efed',
    backgroundColor: '#fff',
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e8efed',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: '#eef8f4',
    borderColor: '#2aa884',
  },
  tabLabel: { fontSize: 14, color: '#111827' },
  tabLabelActive: { color: '#2aa884' },

  post: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8efed',
    padding: 14,
    marginVertical: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#eef8f4',
    borderWidth: 1,
    borderColor: '#2aa884',
  },
  chipEmoji: { fontSize: 14, marginRight: 4 },
  chipText: { fontSize: 12, color: '#2aa884' },
  bestBadge: {
    marginLeft: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#fff3d6',
    borderWidth: 1,
    borderColor: '#ffe0a3',
  },
  bestBadgeText: {
    fontSize: 11,
    color: '#b17a00',
  },
  time: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#6b7b87',
  },
  content: {
    fontSize: 15,
    lineHeight: 21,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeBtn: {},
  likeBtnActive: {
    backgroundColor: '#eef8f4',
    borderColor: '#2aa884',
  },
  drop: { fontSize: 16 },
  likeCount: { fontWeight: '700' },
  reportBtn: {
    marginLeft: 'auto',
    backgroundColor: '#fff6f6',
    borderColor: '#f3d0d0',
  },
  reportText: {
    color: '#b35151',
  },

  toast: {
    position: 'absolute',
    top: 18,
    left: '50%',
    transform: [{ translateX: -100 }],
    width: 200,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#111a',
    alignItems: 'center',
  },
  toastText: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: '#0006',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    width: '88%',
    maxWidth: 520,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalSubtitle: { fontSize: 13, color: '#6b7b87', marginTop: 4 },
  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalLabel: {
    fontSize: 13,
    color: '#6b7b87',
    marginBottom: 6,
  },
  reasonRow: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 4,
  },
  reasonRowActive: {
    borderColor: '#2aa884',
    backgroundColor: '#eef8f4',
  },
  memoInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalFoot: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  modalBtn: {
    minWidth: 70,
    justifyContent: 'center',
  },
})
