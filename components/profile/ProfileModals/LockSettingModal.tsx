import React from 'react'
import { Modal, View, Text, TouchableOpacity } from 'react-native'

export default function ProfileEditModal({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '800' }}>프로필 설정</Text>

          {/* ...여기에 설정 UI 추가 ... */}

          <TouchableOpacity onPress={onClose} style={{ marginTop: 20 }}>
            <Text>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}
