// app/(tabs)/my.tsx
import React, { useState } from 'react'
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native'

import { useApp } from '@/store/useApp'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileMenu, { MenuItem } from '@/components/profile/ProfileMenu'
import type { ProfileData } from '@/components/profile/ProfileTypes'

type ActiveModal = 'profile' | 'alert' | 'album' | 'export' | 'lock' | 'contact' | 'leave' | null

type Section = { title?: string; items: MenuItem[] }

const MBTI_ITEMS = [
  'ISTJ',
  'ISFJ',
  'INFJ',
  'INTJ',
  'ISTP',
  'ISFP',
  'INFP',
  'INTP',
  'ESTP',
  'ESFP',
  'ENFP',
  'ENTP',
  'ESTJ',
  'ESFJ',
  'ENFJ',
  'ENTJ',
]

export default function MyScreen() {
  const app = useApp()

  // app 데이터 → ProfileData 형태로 매핑 (필요 시 나중에 더 정교하게 연결)
  const [profile, setProfile] = useState<ProfileData>({
    nickname: app.settings.nickname ?? '수연',
    mbti: app.settings.mbti ?? 'INFJ',
    seedName: app.seedName ?? '봄비',
    intro: app.settings.intro ?? '오늘도 마음씨 정원을 잘 가꾸고 있어요.',
    stats: {
      totalRecords: app.records.length,
      totalLikes: app.records.reduce((a, r) => a + (r.likes ?? 0), 0),
      totalBlooms: app.blooms.length,
    },
  })

  const [modal, setModal] = useState<ActiveModal>(null)
  const [toast, setToast] = useState<{ icon: string; msg: string } | null>(null)

  // 프로필 설정 모달용 상태
  const [useEmojiAvatar, setUseEmojiAvatar] = useState(true)
  const [mbtiPickerOpen, setMbtiPickerOpen] = useState(false)

  // 알림 설정 모달용
  const [likeNotiOn, setLikeNotiOn] = useState(true)
  const [routineTime, setRoutineTime] = useState('21:00')

  // 잠금 모달용
  const [lockOn, setLockOn] = useState(false)
  const [lockHint, setLockHint] = useState('내 마음은 내가 지킨다')

  const openModal = (m: ActiveModal) => setModal(m)
  const closeModal = () => setModal(null)

  const showToast = (icon: string, msg: string) => {
    setToast({ icon, msg })
    setTimeout(() => setToast(null), 1800)
  }

  // 메뉴 섹션 – 프로필/알림/앨범/내보내기/잠금/문의/탈퇴/로그아웃
  const sections: Section[] = [
    {
      items: [
        {
          id: 'profile',
          type: 'button',
          label: '프로필 설정',
          onPress: () => openModal('profile'),
        },
        {
          id: 'alert',
          type: 'button',
          label: '알림 설정',
          onPress: () => openModal('alert'),
        },
        {
          id: 'album',
          type: 'button',
          label: '감정꽃 앨범',
          onPress: () => openModal('album'),
        },
        {
          id: 'export',
          type: 'button',
          label: '감정기록 모아보기',
          onPress: () => openModal('export'),
        },
        {
          id: 'lock',
          type: 'button',
          label: '화면 잠금',
          onPress: () => openModal('lock'),
        },
        {
          id: 'contact',
          type: 'button',
          label: '고객 문의',
          onPress: () => openModal('contact'),
        },
        {
          id: 'leave',
          type: 'button',
          label: '회원탈퇴',
          danger: true,
          onPress: () => openModal('leave'),
        },
        {
          id: 'logout',
          type: 'button',
          label: '로그아웃',
          onPress: () => {
            // TODO: 실제 로그아웃 로직 연결
            showToast('🔔', '로그아웃했어요.')
          },
        },
      ],
    },
  ]

  // === 저장/동작 핸들러 ===

  const handleSaveProfile = () => {
    // MBTI 변경사항 저장 (실제 앱 상태와 동기화는 나중에 useApp에 반영)
    setProfile((prev) => ({
      ...prev,
      mbti: profile.mbti || prev.mbti,
    }))
    closeModal()
    showToast('🔔', '프로필을 저장했어요.')
  }

  const handleSaveAlert = () => {
    closeModal()
    showToast('🔔', '정원소식을 저장했어요.')
  }

  const handleSaveLock = () => {
    closeModal()
    showToast('🔒', '잠금 설정을 저장했어요.')
  }

  const handleContactSend = () => {
    closeModal()
    showToast('💌', '문의 내용을 보냈어요.')
  }

  const handleLeaveConfirm = () => {
    closeModal()
    showToast('🌱', '회원탈퇴 처리 요청을 보냈어요.')
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* 공통 토스트 */}
      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastIcon}>{toast.icon}</Text>
          <Text style={styles.toastMsg}>{toast.msg}</Text>
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        {/* 1. 상단 “내 정원” 타이틀 */}
        <View style={styles.titleRow}>
          <Text style={styles.titleIcon}>🌸</Text>
          <Text style={styles.titleText}>내 정원</Text>
        </View>

        {/* 2. 나의 프로필 카드 */}
        <ProfileHeader profile={profile} />

        {/* 3. 프로필 하단 기록 / 공감 / 개화 카운트 */}
        <View style={styles.counterRow}>
          <View style={styles.counterItem}>
            <Text style={styles.counterIcon}>📒</Text>
            <Text style={styles.counterLabel}>기록</Text>
            <Text style={styles.counterValue}>{profile.stats.totalRecords}</Text>
          </View>
          <View style={styles.counterItem}>
            <Text style={styles.counterIcon}>💧</Text>
            <Text style={styles.counterLabel}>공감</Text>
            <Text style={styles.counterValue}>{profile.stats.totalLikes}</Text>
          </View>
          <View style={styles.counterItem}>
            <Text style={styles.counterIcon}>🌸</Text>
            <Text style={styles.counterLabel}>개화</Text>
            <Text style={styles.counterValue}>{profile.stats.totalBlooms}</Text>
          </View>
        </View>

        {/* 4. 메뉴 리스트 */}
        <ProfileMenu sections={sections} />
      </ScrollView>

      {/* === 모달 영역 === */}

      {/* 1) 프로필 설정 모달 */}
      <Modal transparent visible={modal === 'profile'} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>프로필 설정</Text>

            {/* 아바타 + 사진 / 이모티콘 선택 */}
            <View style={[styles.row, { marginTop: 12 }]}>
              <View style={styles.avatar}>
                {useEmojiAvatar ? (
                  <Text style={{ fontSize: 32 }}>😊</Text>
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={{ color: '#888', fontSize: 11 }}>사진</Text>
                  </View>
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.fieldLabel}>프로필 사진</Text>
                <Text style={styles.helper}>
                  사진을 첨부하거나, 기본 마음씨 이모티콘을 사용할 수 있어요.
                </Text>

                <View style={styles.avatarBtnRow}>
                  <TouchableOpacity
                    style={[styles.smallToggleBtn, !useEmojiAvatar && styles.smallToggleBtnActive]}
                    onPress={() => {
                      setUseEmojiAvatar(false)
                      // TODO: 실제 이미지 선택 기능은 추후 expo-image-picker 연동
                    }}
                  >
                    <Text
                      style={[
                        styles.smallToggleText,
                        !useEmojiAvatar && styles.smallToggleTextActive,
                      ]}
                    >
                      사진 첨부
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallToggleBtn, useEmojiAvatar && styles.smallToggleBtnActive]}
                    onPress={() => setUseEmojiAvatar(true)}
                  >
                    <Text
                      style={[
                        styles.smallToggleText,
                        useEmojiAvatar && styles.smallToggleTextActive,
                      ]}
                    >
                      기본 이모티콘
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.sep} />

            {/* MBTI 드롭다운 */}
            <Text style={styles.fieldLabel}>MBTI</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setMbtiPickerOpen(true)}>
              <Text style={styles.dropdownText}>{profile.mbti || 'MBTI 선택'}</Text>
            </TouchableOpacity>

            <View style={styles.sheetFooter}>
              <TouchableOpacity style={styles.btnGhost} onPress={closeModal}>
                <Text style={styles.btnGhostText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleSaveProfile}>
                <Text style={styles.btnPrimaryText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MBTI 선택 모달 (드롭다운 내용) */}
      <Modal transparent visible={mbtiPickerOpen} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.sheet, { maxHeight: 420 }]}>
            <Text style={styles.sheetTitle}>MBTI 선택</Text>
            <ScrollView style={{ marginTop: 12 }}>
              {MBTI_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.mbtiItem}
                  onPress={() => {
                    setProfile((prev) => ({ ...prev, mbti: item }))
                    setMbtiPickerOpen(false)
                  }}
                >
                  <Text
                    style={[
                      styles.mbtiItemText,
                      profile.mbti === item && styles.mbtiItemTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.sheetFooter}>
              <TouchableOpacity style={styles.btnGhost} onPress={() => setMbtiPickerOpen(false)}>
                <Text style={styles.btnGhostText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2) 알림 설정 모달 */}
      <Modal transparent visible={modal === 'alert'} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>알림 설정</Text>

            <View style={styles.rowBetween}>
              <Text style={styles.fieldLabel}>공감 알림</Text>
              <TouchableOpacity
                style={[styles.switch, likeNotiOn && styles.switchOn]}
                onPress={() => setLikeNotiOn((v) => !v)}
              >
                <View style={[styles.knob, likeNotiOn && { transform: [{ translateX: 18 }] }]} />
              </TouchableOpacity>
            </View>

            <View style={styles.sep} />

            <View style={styles.rowBetween}>
              <Text style={styles.fieldLabel}>기록 루틴 시간</Text>
              <TextInput
                style={[styles.input, { width: 80 }]}
                value={routineTime}
                onChangeText={setRoutineTime}
                placeholder="21:00"
              />
            </View>

            <View style={styles.sheetFooter}>
              <TouchableOpacity style={styles.btnGhost} onPress={closeModal}>
                <Text style={styles.btnGhostText}>닫기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleSaveAlert}>
                <Text style={styles.btnPrimaryText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3) 감정꽃 앨범 모달 – 구조만 잡아둠 */}
      <Modal transparent visible={modal === 'album'} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>감정꽃 앨범</Text>
            <Text style={styles.helper}>
              감정꽃 썸네일 그리드는 나중에 blooms 데이터와 연결해서 구현하면 돼.
            </Text>
            <View style={styles.albumGridPlaceholder}>
              <Text style={{ color: '#aaa' }}>🌸 앨범 준비 중</Text>
            </View>
            <View style={styles.sheetFooter}>
              <TouchableOpacity style={styles.btnGhost} onPress={closeModal}>
                <Text style={styles.btnGhostText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 4) 감정기록 모아보기 / 내보내기 모달 */}
      <Modal transparent visible={modal === 'export'} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>감정기록 모아보기</Text>
            <Text style={styles.helper}>
              CSV · JSON 파일로 백업하거나, 요약 리포트 화면으로 이동하는 기능을 연결하면 돼.
            </Text>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => showToast('📄', 'CSV 내보내기 기능은 나중에 연결할게요.')}
            >
              <Text style={styles.modalBtnText}>CSV로 내보내기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => showToast('📦', 'JSON 내보내기 기능은 나중에 연결할게요.')}
            >
              <Text style={styles.modalBtnText}>JSON으로 내보내기</Text>
            </TouchableOpacity>

            <View style={styles.sheetFooter}>
              <TouchableOpacity style={styles.btnGhost} onPress={closeModal}>
                <Text style={styles.btnGhostText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 5) 화면 잠금 모달 */}
      <Modal transparent visible={modal === 'lock'} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>화면 잠금</Text>

            <View style={styles.rowBetween}>
              <Text style={styles.fieldLabel}>앱 잠금 사용</Text>
              <TouchableOpacity
                style={[styles.switch, lockOn && styles.switchOn]}
                onPress={() => setLockOn((v) => !v)}
              >
                <View style={[styles.knob, lockOn && { transform: [{ translateX: 18 }] }]} />
              </TouchableOpacity>
            </View>

            <View style={styles.sep} />

            <Text style={styles.fieldLabel}>잠금 힌트</Text>
            <TextInput
              style={styles.input}
              value={lockHint}
              onChangeText={setLockHint}
              placeholder="잠금 해제 힌트를 적어둘 수 있어요."
            />

            <View style={styles.sheetFooter}>
              <TouchableOpacity style={styles.btnGhost} onPress={closeModal}>
                <Text style={styles.btnGhostText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleSaveLock}>
                <Text style={styles.btnPrimaryText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 6) 고객 문의 모달 */}
      <Modal transparent visible={modal === 'contact'} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>고객 문의</Text>
            <Text style={styles.helper}>
              문의 내용을 간단히 적어주세요. 실제 앱에서는 이메일 전송이나 인앱 문의함으로 연결하면
              돼.
            </Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              multiline
              placeholder="무엇이 궁금한가요?"
            />
            <View style={styles.sheetFooter}>
              <TouchableOpacity style={styles.btnGhost} onPress={closeModal}>
                <Text style={styles.btnGhostText}>닫기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleContactSend}>
                <Text style={styles.btnPrimaryText}>보내기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 7) 회원탈퇴 모달 */}
      <Modal transparent visible={modal === 'leave'} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>정말 탈퇴하실까요?</Text>
            <Text style={styles.helper}>
              정원을 삭제하면 기록과 감정꽃도 함께 사라져요. 나중에 마음이 바뀔 수도 있으니 한 번 더
              생각해봐도 좋아요.
            </Text>
            <View style={styles.sheetFooter}>
              <TouchableOpacity style={styles.btnGhost} onPress={closeModal}>
                <Text style={styles.btnGhostText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnDanger} onPress={handleLeaveConfirm}>
                <Text style={styles.btnDangerText}>정말 탈퇴할게요</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fffdfb',
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },

  // 상단 타이틀
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
  },

  // 프로필 카운터
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  counterItem: {
    flex: 1,
    alignItems: 'center',
  },
  counterIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  counterLabel: {
    fontSize: 12,
    color: '#8b7c6a',
  },
  counterValue: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '700',
  },

  // 토스트
  toast: {
    position: 'absolute',
    top: 18,
    left: '50%',
    transform: [{ translateX: -150 }],
    width: 300,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#111a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 50,
  },
  toastIcon: {
    fontSize: 16,
    color: '#fff',
  },
  toastMsg: {
    color: '#fff',
    fontSize: 13,
  },

  // 공통 모달 레이아웃
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#0006',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sheetFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3d7c8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdf6ee',
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  helper: {
    marginTop: 6,
    color: '#8b7c6a',
    fontSize: 12,
  },
  sep: {
    height: 1,
    backgroundColor: '#f0e6dc',
    marginVertical: 16,
  },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#ece7e2',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    backgroundColor: '#fff',
    fontSize: 14,
  },

  // 스위치
  switch: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ddd',
    padding: 2,
    position: 'relative',
  },
  switchOn: {
    backgroundColor: '#1f1f1f',
  },
  knob: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },

  albumGridPlaceholder: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#f0e6dc',
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffaf3',
  },

  modalBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ece7e2',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  // 프로필 사진 토글 버튼
  avatarBtnRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  smallToggleBtn: {
    flex: 0,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5d9cc',
    backgroundColor: '#fff',
  },
  smallToggleBtnActive: {
    backgroundColor: '#ffeff5',
    borderColor: '#ff80a7',
  },
  smallToggleText: {
    fontSize: 11,
    color: '#7b6b59',
  },
  smallToggleTextActive: {
    color: '#d3477c',
    fontWeight: '600',
  },

  // 드롭다운
  dropdown: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#ece7e2',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  mbtiItem: {
    paddingVertical: 10,
  },
  mbtiItemText: {
    fontSize: 14,
    color: '#444',
  },
  mbtiItemTextActive: {
    fontWeight: '700',
    color: '#d3477c',
  },

  btnGhost: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ece7e2',
    backgroundColor: '#fff',
  },
  btnGhostText: {
    fontSize: 14,
    color: '#555',
  },
  btnPrimary: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#ff80a7',
  },
  btnPrimaryText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  btnDanger: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#d83a52',
  },
  btnDangerText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
})
