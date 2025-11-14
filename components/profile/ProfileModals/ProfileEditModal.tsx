// components/profile/ProfileModals/ProfileEditModal.tsx

import * as ImagePicker from 'expo-image-picker'
import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native'
import { useApp } from '@/store/useApp'

type Props = {
  visible: boolean
  onClose: () => void
}

const MBTI_LIST = [
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

export default function ProfileEditModal({ visible, onClose }: Props) {
  const app = useApp()

  // ⭐ store에 추가한 필드들에서 초기값 가져오기
  const [nickname, setNickname] = useState(app.settings.nickname ?? '')
  const [mbti, setMbti] = useState(app.settings.mbti ?? '')
  const [seedName, setSeedNameLocal] = useState(app.seedName ?? '')
  const [intro, setIntro] = useState(app.settings.intro ?? '')
  const [mbtiPickerOpen, setMbtiPickerOpen] = useState(false)

  // 사진 vs 기본 이모티콘 선택 상태
  const [avatarMode, setAvatarMode] = useState<'image' | 'emoji'>(
    app.settings.profileImageUri ? 'image' : 'emoji'
  )

  const handlePickImage = async () => {
    try {
      // 1) 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('권한 필요', '갤러리 접근 권한을 허용해 주세요.')
        return
      }

      // 2) 갤러리 열기
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (result.canceled) return

      const asset = result.assets?.[0]
      if (!asset?.uri) return

      // 3) store에 프로필 이미지 경로 저장
      await app.setProfileImage(asset.uri)
      setAvatarMode('image')
    } catch (e) {
      console.warn(e)
      Alert.alert('오류', '이미지를 불러오는 중 문제가 발생했어요.')
    }
  }

  const handleUseDefaultEmoji = async () => {
    setAvatarMode('emoji')
    await app.setProfileImage(undefined)
  }

  const handleSave = async () => {
    try {
      // 1) MBTI / 닉네임 / 소개 저장 (settings)
      await app.setSettings({
        nickname: nickname.trim() || undefined,
        mbti: mbti || undefined,
        intro: intro.trim() || undefined,
      })

      // 2) 씨앗 이름은 월 1회 제한 로직 사용
      if (seedName && seedName.trim()) {
        const res = await app.setSeedNameWithLimit(seedName.trim())
        if (res === 'blocked') {
          Alert.alert('씨앗 이름 변경', '씨앗 이름은 한 달에 한 번만 바꿀 수 있어요.')
        } else if (res === 'invalid') {
          Alert.alert('씨앗 이름', '씨앗 이름은 1~12자 사이로 입력해 주세요.')
          return
        }
      }

      // 3) 프로필 이미지 처리
      if (avatarMode === 'emoji') {
        // 기본 이모티콘 사용: 실제 이미지는 제거
        await app.setProfileImage(undefined)
      } else {
        // avatarMode === 'image' 인 경우에는
        // 지금은 별도의 이미지 선택 로직이 없으므로
        // app.settings.profileImageUri 그대로 둔다.
        // 나중에 expo-image-picker 연결 시 여기서 setProfileImage(uri) 호출
      }

      onClose()
    } catch (e) {
      console.warn('ProfileEditModal save error', e)
      Alert.alert('프로필 설정', '저장 중 오류가 발생했어요.')
    }
  }

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.panel}>
          <ScrollView contentContainerStyle={s.panelInner}>
            <Text style={s.title}>프로필 설정</Text>

            {/* 1) 프로필 이미지 선택 (사진 첨부 + 기본 이모티콘) */}
            <Text style={s.fieldLabel}>프로필 이미지</Text>
            <View style={s.avatarRow}>
              <TouchableOpacity
                style={[s.avatarButton, avatarMode === 'image' && s.avatarButtonActive]}
                onPress={handlePickImage}
              >
                <Text style={s.avatarEmoji}>📷</Text>
                <Text style={s.avatarText}>사진 선택</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.avatarButton, avatarMode === 'emoji' && s.avatarButtonActive]}
                onPress={handleUseDefaultEmoji}
              >
                <Text style={s.avatarEmoji}>🌱</Text>
                <Text style={s.avatarText}>기본 이모티콘</Text>
              </TouchableOpacity>
            </View>

            {/* 2) 닉네임 */}
            <Text style={s.fieldLabel}>닉네임</Text>
            <TextInput
              style={s.input}
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChangeText={setNickname}
            />

            {/* 3) MBTI - 드롭다운 */}
            <Text style={s.fieldLabel}>MBTI</Text>
            <TouchableOpacity style={s.dropdown} onPress={() => setMbtiPickerOpen((v) => !v)}>
              <Text style={s.dropdownText}>{mbti || 'MBTI 선택'}</Text>
            </TouchableOpacity>

            {mbtiPickerOpen && (
              <View style={s.mbtiGrid}>
                {MBTI_LIST.map((type) => {
                  const selected = type === mbti
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[s.mbtiChip, selected && s.mbtiChipSelected]}
                      onPress={() => {
                        setMbti(type)
                        setMbtiPickerOpen(false)
                      }}
                    >
                      <Text style={[s.mbtiChipText, selected && s.mbtiChipTextSelected]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}

            {/* 4) 씨앗 이름 */}
            <Text style={s.fieldLabel}>씨앗 이름</Text>
            <TextInput
              style={s.input}
              placeholder="내 정원 씨앗의 이름"
              value={seedName}
              onChangeText={setSeedNameLocal}
            />

            {/* 5) 한 줄 소개 */}
            <Text style={s.fieldLabel}>한 줄 소개</Text>
            <TextInput
              style={[s.input, s.multiline]}
              placeholder="나를 표현하는 한 문장"
              value={intro}
              onChangeText={setIntro}
              multiline
            />

            {/* 버튼 영역 */}
            <View style={s.buttonRow}>
              <TouchableOpacity style={[s.button, s.buttonGhost]} onPress={onClose}>
                <Text style={[s.buttonText, s.buttonGhostText]}>닫기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.button, s.buttonPrimary]} onPress={handleSave}>
                <Text style={[s.buttonText, s.buttonPrimaryText]}>저장하기</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  panelInner: {
    padding: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fafafa',
  },
  multiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
  },
  avatarButtonActive: {
    borderColor: '#ff8fa3',
    backgroundColor: '#ffe9ef',
  },
  avatarEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 12,
    color: '#555',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  mbtiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  mbtiChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  mbtiChipSelected: {
    backgroundColor: '#ff8fa3',
    borderColor: '#ff8fa3',
  },
  mbtiChipText: {
    fontSize: 12,
    color: '#555',
  },
  mbtiChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  buttonGhost: {
    backgroundColor: '#f4f4f4',
  },
  buttonGhostText: {
    color: '#555',
  },
  buttonPrimary: {
    backgroundColor: '#ff8fa3',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  buttonText: {
    fontSize: 14,
  },
})
