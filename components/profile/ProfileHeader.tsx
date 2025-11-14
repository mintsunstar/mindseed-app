// components/profile/ProfileHeader.tsx
import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'

type Props = {
  profileImageUri?: string
  mbti?: string
  recordCount: number
  likeCount: number
  bloomCount: number
}

export default function ProfileHeader({
  profileImageUri,
  mbti = 'INFJ',
  recordCount,
  likeCount,
  bloomCount,
}: Props) {
  return (
    <View style={s.card}>
      <View style={s.row}>
        {/* 프로필 썸네일 */}
        <View style={s.avatarWrap}>
          {profileImageUri ? (
            <Image source={{ uri: profileImageUri }} style={s.avatarImg} />
          ) : (
            <View style={s.avatarFallback}>
              <Text style={s.avatarEmoji}>🌱</Text>
            </View>
          )}
        </View>

        {/* 텍스트 정보 */}
        <View style={s.info}>
          <Text style={s.name}>나의 프로필</Text>
          <Text style={s.sub}>
            MBTI <Text style={s.bold}>{mbti}</Text>
          </Text>
        </View>
      </View>
    </View>
  )
}

function Badge({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <View style={s.badge}>
      <Text style={s.badgeIcon}>{icon}</Text>
      <Text style={s.badgeText}>
        {label} {value}
      </Text>
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ece7e2',
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 34,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  sub: {
    fontSize: 13,
    color: '#6b7280',
  },
  bold: {
    fontWeight: '700',
    color: '#111827',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#f3f4ff',
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  badgeIcon: {
    fontSize: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
})
